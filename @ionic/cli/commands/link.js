"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkCommand = void 0;
const cli_framework_1 = require("@ionic/cli-framework");
const cli_framework_prompts_1 = require("@ionic/cli-framework-prompts");
const utils_terminal_1 = require("@ionic/utils-terminal");
const Debug = require("debug");
const constants_1 = require("../constants");
const guards_1 = require("../guards");
const color_1 = require("../lib/color");
const command_1 = require("../lib/command");
const errors_1 = require("../lib/errors");
const executor_1 = require("../lib/executor");
const open_1 = require("../lib/open");
const debug = Debug('ionic:commands:link');
const CHOICE_CREATE_NEW_APP = 'createNewApp';
const CHOICE_NEVERMIND = 'nevermind';
const CHOICE_RELINK = 'relink';
const CHOICE_LINK_EXISTING_APP = 'linkExistingApp';
const CHOICE_IONIC = 'ionic';
const CHOICE_GITHUB = 'github';
const CHOICE_SKIP = 'skip';
const CHOICE_MASTER_ONLY = 'master';
const CHOICE_SPECIFIC_BRANCHES = 'specific';
class LinkCommand extends command_1.Command {
    async getMetadata() {
        const projectFile = this.project ? utils_terminal_1.prettyPath(this.project.filePath) : constants_1.PROJECT_FILE;
        return {
            name: 'link',
            type: 'project',
            groups: ["paid" /* PAID */],
            summary: 'Connect local apps to Ionic',
            description: `
Link apps on Ionic Appflow to local Ionic projects with this command.

If the ${color_1.input('id')} argument is excluded, this command will prompt you to select an app from Ionic Appflow.

Ionic Appflow uses a git-based workflow to manage app updates. During the linking process, select ${color_1.strong('GitHub')} (recommended) or ${color_1.strong('Ionic Appflow')} as a git host. See our documentation[^appflow-git-basics] for more information.

Ultimately, this command sets the ${color_1.strong('id')} property in ${color_1.strong(utils_terminal_1.prettyPath(projectFile))}, which marks this app as linked.

If you are having issues linking, please get in touch with our Support[^support-request].
      `,
            footnotes: [
                {
                    id: 'appflow-git-basics',
                    url: 'https://ionicframework.com/docs/appflow/basics/git',
                    shortUrl: 'https://ion.link/appflow-git-basics',
                },
                {
                    id: 'support-request',
                    url: 'https://ion.link/support-request',
                },
            ],
            exampleCommands: ['', 'a1b2c3d4'],
            inputs: [
                {
                    name: 'id',
                    summary: `The Ionic Appflow ID of the app to link (e.g. ${color_1.input('a1b2c3d4')})`,
                },
            ],
            options: [
                {
                    name: 'name',
                    summary: 'The app name to use during the linking of a new app',
                    groups: ["hidden" /* HIDDEN */],
                },
                {
                    name: 'create',
                    summary: 'Create a new app on Ionic Appflow and link it with this local Ionic project',
                    type: Boolean,
                    groups: ["hidden" /* HIDDEN */],
                },
                {
                    name: 'pro-id',
                    summary: 'Specify an app ID from the Ionic Appflow to link',
                    groups: ["deprecated" /* DEPRECATED */, "hidden" /* HIDDEN */],
                    spec: { value: 'id' },
                },
            ],
        };
    }
    async preRun(inputs, options) {
        const { create } = options;
        if (inputs[0] && create) {
            throw new errors_1.FatalException(`Sorry--cannot use both ${color_1.input('id')} and ${color_1.input('--create')}. You must either link an existing app or create a new one.`);
        }
        const id = options['pro-id'] ? String(options['pro-id']) : undefined;
        if (id) {
            inputs[0] = id;
        }
    }
    async run(inputs, options, runinfo) {
        const { promptToLogin } = await Promise.resolve().then(() => require('../lib/session'));
        if (!this.project) {
            throw new errors_1.FatalException(`Cannot run ${color_1.input('ionic link')} outside a project directory.`);
        }
        let id = inputs[0];
        let { create } = options;
        const idFromConfig = this.project.config.get('id');
        if (idFromConfig) {
            if (id && idFromConfig === id) {
                this.env.log.msg(`Already linked with app ${color_1.input(id)}.`);
                return;
            }
            const msg = id ?
                `Are you sure you want to link it to ${color_1.input(id)} instead?` :
                `Would you like to run link again?`;
            const confirm = await this.env.prompt({
                type: 'confirm',
                name: 'confirm',
                message: `App ID ${color_1.input(idFromConfig)} is already set up with this app. ${msg}`,
            });
            if (!confirm) {
                this.env.log.msg('Not linking.');
                return;
            }
        }
        if (!this.env.session.isLoggedIn()) {
            await promptToLogin(this.env);
        }
        if (!id && !create) {
            const choices = [
                {
                    name: `Link ${idFromConfig ? 'a different' : 'an existing'} app on Ionic Appflow`,
                    value: CHOICE_LINK_EXISTING_APP,
                },
                {
                    name: 'Create a new app on Ionic Appflow',
                    value: CHOICE_CREATE_NEW_APP,
                },
            ];
            if (idFromConfig) {
                choices.unshift({
                    name: `Relink ${color_1.input(idFromConfig)}`,
                    value: CHOICE_RELINK,
                });
            }
            const result = await this.env.prompt({
                type: 'list',
                name: 'whatToDo',
                message: 'What would you like to do?',
                choices,
            });
            if (result === CHOICE_CREATE_NEW_APP) {
                create = true;
                id = undefined;
            }
            else if (result === CHOICE_LINK_EXISTING_APP) {
                const tasks = this.createTaskChain();
                tasks.next(`Looking up your apps`);
                const apps = [];
                const appClient = await this.getAppClient();
                const paginator = appClient.paginate();
                for (const r of paginator) {
                    const res = await r;
                    apps.push(...res.data);
                }
                tasks.end();
                if (apps.length === 0) {
                    const confirm = await this.env.prompt({
                        type: 'confirm',
                        name: 'confirm',
                        message: `No apps found. Would you like to create a new app on Ionic Appflow?`,
                    });
                    if (!confirm) {
                        throw new errors_1.FatalException(`Cannot link without an app selected.`);
                    }
                    create = true;
                    id = undefined;
                }
                else {
                    const choice = await this.chooseApp(apps);
                    if (choice === CHOICE_NEVERMIND) {
                        this.env.log.info('Not linking app.');
                        id = undefined;
                    }
                    else {
                        id = choice;
                    }
                }
            }
            else if (result === CHOICE_RELINK) {
                id = idFromConfig;
            }
        }
        if (create) {
            let name = options['name'] ? String(options['name']) : undefined;
            if (!name) {
                name = await this.env.prompt({
                    type: 'input',
                    name: 'name',
                    message: 'Please enter a name for your new app:',
                    validate: v => cli_framework_1.validators.required(v),
                });
            }
            id = await this.createApp({ name }, runinfo);
        }
        else if (id) {
            const app = await this.lookUpApp(id);
            await this.linkApp(app, runinfo);
        }
    }
    async getAppClient() {
        const { AppClient } = await Promise.resolve().then(() => require('../lib/app'));
        const token = await this.env.session.getUserToken();
        return new AppClient(token, this.env);
    }
    async getUserClient() {
        const { UserClient } = await Promise.resolve().then(() => require('../lib/user'));
        const token = await this.env.session.getUserToken();
        return new UserClient(token, this.env);
    }
    async lookUpApp(id) {
        const tasks = this.createTaskChain();
        tasks.next(`Looking up app ${color_1.input(id)}`);
        const appClient = await this.getAppClient();
        const app = await appClient.load(id); // Make sure the user has access to the app
        tasks.end();
        return app;
    }
    async createApp({ name }, runinfo) {
        const appClient = await this.getAppClient();
        const org_id = this.env.config.get('org.id');
        const app = await appClient.create({ name, org_id });
        await this.linkApp(app, runinfo);
        return app.id;
    }
    async linkApp(app, runinfo) {
        // TODO: load connections
        // TODO: check for git availability before this
        this.env.log.nl();
        this.env.log.info(`Ionic Appflow uses a git-based workflow to manage app updates.\n` +
            `You will be prompted to set up the git host and repository for this new app. See the docs${color_1.ancillary('[1]')} for more information.\n\n` +
            `${color_1.ancillary('[1]')}: ${color_1.strong('https://ion.link/appflow-git-basics')}`);
        this.env.log.nl();
        const service = await this.env.prompt({
            type: 'list',
            name: 'gitService',
            message: 'Which git host would you like to use?',
            choices: [
                {
                    name: 'GitHub',
                    value: CHOICE_GITHUB,
                },
                {
                    name: 'Ionic Appflow',
                    value: CHOICE_IONIC,
                },
                {
                    name: 'Don\'t use a git host',
                    value: CHOICE_SKIP,
                },
            ],
        });
        let githubUrl;
        if (service === CHOICE_IONIC) {
            if (!this.env.config.get('git.setup')) {
                await executor_1.runCommand(runinfo, ['ssh', 'setup']);
            }
            await executor_1.runCommand(runinfo, ['config', 'set', 'id', `"${app.id}"`, '--json']);
            await executor_1.runCommand(runinfo, ['git', 'remote']);
        }
        else {
            if (service === CHOICE_GITHUB) {
                githubUrl = await this.linkGithub(app);
            }
            await executor_1.runCommand(runinfo, ['config', 'set', 'id', `"${app.id}"`, '--json']);
        }
        this.env.log.ok(`Project linked with app ${color_1.input(app.id)}!`);
        if (service === CHOICE_GITHUB) {
            this.env.log.info(`Here are some additional links that can help you with you first push to GitHub:\n` +
                `${color_1.strong('Adding GitHub as a remote')}:\n\t${color_1.strong('https://help.github.com/articles/adding-a-remote/')}\n\n` +
                `${color_1.strong('Pushing to a remote')}:\n\t${color_1.strong('https://help.github.com/articles/pushing-to-a-remote/')}\n\n` +
                `${color_1.strong('Working with branches')}:\n\t${color_1.strong('https://guides.github.com/introduction/flow/')}\n\n` +
                `${color_1.strong('More comfortable with a GUI? Try GitHub Desktop!')}\n\t${color_1.strong('https://desktop.github.com/')}`);
            if (githubUrl) {
                this.env.log.info(`You can now push to one of your branches on GitHub to trigger a build in Ionic Appflow!\n` +
                    `If you haven't added GitHub as your origin you can do so by running:\n\n` +
                    `${color_1.input('git remote add origin ' + githubUrl)}\n\n` +
                    `You can find additional links above to help if you're having issues.`);
            }
        }
    }
    async linkGithub(app) {
        const { id } = this.env.session.getUser();
        const userClient = await this.getUserClient();
        const user = await userClient.load(id, { fields: ['oauth_identities'] });
        if (!user.oauth_identities || !user.oauth_identities.github) {
            await this.oAuthProcess(id);
        }
        if (await this.needsAssociation(app, user.id)) {
            await this.confirmGithubRepoExists();
            const repoId = await this.selectGithubRepo();
            const branches = await this.selectGithubBranches(repoId);
            return this.connectGithub(app, repoId, branches);
        }
    }
    async confirmGithubRepoExists() {
        let confirm = false;
        this.env.log.nl();
        this.env.log.info(color_1.strong(`In order to link to a GitHub repository the repository must already exist on GitHub.`));
        this.env.log.info(`${color_1.strong('If the repository does not exist please create one now before continuing.')}\n` +
            `If you're not familiar with Git you can learn how to set it up with GitHub here:\n\n` +
            color_1.strong(`https://help.github.com/articles/set-up-git/ \n\n`) +
            `You can find documentation on how to create a repository on GitHub and push to it here:\n\n` +
            color_1.strong(`https://help.github.com/articles/create-a-repo/`));
        confirm = await this.env.prompt({
            type: 'confirm',
            name: 'confirm',
            message: 'Does the repository exist on GitHub?',
        });
        if (!confirm) {
            throw new errors_1.FatalException(`Repo must exist on GitHub in order to link. Please create the repo and run ${color_1.input('ionic link')} again.`);
        }
    }
    async oAuthProcess(userId) {
        const userClient = await this.getUserClient();
        let confirm = false;
        this.env.log.nl();
        this.env.log.info(`GitHub OAuth setup required.\n` +
            `To continue, we need you to authorize Ionic Appflow with your GitHub account. ` +
            `A browser will open and prompt you to complete the authorization request. ` +
            `When finished, please return to the CLI to continue linking your app.`);
        confirm = await this.env.prompt({
            type: 'confirm',
            name: 'ready',
            message: 'Open browser:',
        });
        if (!confirm) {
            throw new errors_1.FatalException(`GitHub OAuth setup is required to link to GitHub repository. Please run ${color_1.input('ionic link')} again when ready.`);
        }
        const url = await userClient.oAuthGithubLogin(userId);
        await open_1.openUrl(url);
        confirm = await this.env.prompt({
            type: 'confirm',
            name: 'ready',
            message: 'Authorized and ready to continue:',
        });
        if (!confirm) {
            throw new errors_1.FatalException(`GitHub OAuth setup is required to link to GitHub repository. Please run ${color_1.input('ionic link')} again when ready.`);
        }
    }
    async needsAssociation(app, userId) {
        const appClient = await this.getAppClient();
        if (app.association && app.association.repository.html_url) {
            this.env.log.msg(`App ${color_1.input(app.id)} already connected to ${color_1.strong(app.association.repository.html_url)}`);
            const confirm = await this.env.prompt({
                type: 'confirm',
                name: 'confirm',
                message: 'Would you like to connect a different repo?',
            });
            if (!confirm) {
                return false;
            }
            try {
                // TODO: maybe we can use a PUT instead of DELETE now + POST later?
                await appClient.deleteAssociation(app.id);
            }
            catch (e) {
                if (guards_1.isSuperAgentError(e)) {
                    if (e.response.status === 401) {
                        await this.oAuthProcess(userId);
                        await appClient.deleteAssociation(app.id);
                        return true;
                    }
                    else if (e.response.status === 404) {
                        debug(`DELETE ${app.id} GitHub association not found`);
                        return true;
                    }
                }
                throw e;
            }
        }
        return true;
    }
    async connectGithub(app, repoId, branches) {
        const appClient = await this.getAppClient();
        try {
            const association = await appClient.createAssociation(app.id, { repoId, type: 'github', branches });
            this.env.log.ok(`App ${color_1.input(app.id)} connected to ${color_1.strong(association.repository.html_url)}`);
            return association.repository.html_url;
        }
        catch (e) {
            if (guards_1.isSuperAgentError(e) && e.response.status === 403) {
                throw new errors_1.FatalException(e.response.body.error.message);
            }
        }
    }
    formatRepoName(fullName) {
        const [org, name] = fullName.split('/');
        return `${color_1.weak(`${org} /`)} ${name}`;
    }
    async chooseApp(apps) {
        const { formatName } = await Promise.resolve().then(() => require('../lib/app'));
        const neverMindChoice = {
            name: color_1.strong('Nevermind'),
            id: CHOICE_NEVERMIND,
            value: CHOICE_NEVERMIND,
            org: null,
        };
        const linkedApp = await this.env.prompt({
            type: 'list',
            name: 'linkedApp',
            message: 'Which app would you like to link',
            choices: [
                ...apps.map(app => ({
                    name: `${formatName(app)} ${color_1.weak(`(${app.id})`)}`,
                    value: app.id,
                })),
                cli_framework_prompts_1.createPromptChoiceSeparator(),
                neverMindChoice,
                cli_framework_prompts_1.createPromptChoiceSeparator(),
            ],
        });
        return linkedApp;
    }
    async selectGithubRepo() {
        const user = this.env.session.getUser();
        const userClient = await this.getUserClient();
        const tasks = this.createTaskChain();
        const task = tasks.next('Looking up your GitHub repositories');
        const paginator = userClient.paginateGithubRepositories(user.id);
        const repos = [];
        try {
            for (const r of paginator) {
                const res = await r;
                repos.push(...res.data);
                task.msg = `Looking up your GitHub repositories: ${color_1.strong(String(repos.length))} found`;
            }
        }
        catch (e) {
            tasks.fail();
            if (guards_1.isSuperAgentError(e) && e.response.status === 401) {
                await this.oAuthProcess(user.id);
                return this.selectGithubRepo();
            }
            throw e;
        }
        tasks.end();
        const repoId = await this.env.prompt({
            type: 'list',
            name: 'githubRepo',
            message: 'Which GitHub repository would you like to link?',
            choices: repos.map(repo => ({
                name: this.formatRepoName(repo.full_name),
                value: String(repo.id),
            })),
        });
        return Number(repoId);
    }
    async selectGithubBranches(repoId) {
        this.env.log.nl();
        this.env.log.info(color_1.strong(`By default Ionic Appflow links only to the ${color_1.input('master')} branch.`));
        this.env.log.info(`${color_1.strong('If you\'d like to link to another branch or multiple branches you\'ll need to select each branch to connect to.')}\n` +
            `If you're not familiar with on working with branches in GitHub you can read about them here:\n\n` +
            color_1.strong(`https://guides.github.com/introduction/flow/ \n\n`));
        const choice = await this.env.prompt({
            type: 'list',
            name: 'githubMultipleBranches',
            message: 'Which would you like to do?',
            choices: [
                {
                    name: `Link to master branch only`,
                    value: CHOICE_MASTER_ONLY,
                },
                {
                    name: `Link to specific branches`,
                    value: CHOICE_SPECIFIC_BRANCHES,
                },
            ],
        });
        switch (choice) {
            case CHOICE_MASTER_ONLY:
                return ['master'];
            case CHOICE_SPECIFIC_BRANCHES:
                // fall through and begin prompting to choose branches
                break;
            default:
                throw new errors_1.FatalException('Aborting. No branch choice specified.');
        }
        const user = this.env.session.getUser();
        const userClient = await this.getUserClient();
        const paginator = userClient.paginateGithubBranches(user.id, repoId);
        const tasks = this.createTaskChain();
        const task = tasks.next('Looking for available branches');
        const availableBranches = [];
        try {
            for (const r of paginator) {
                const res = await r;
                availableBranches.push(...res.data);
                task.msg = `Looking up the available branches on your GitHub repository: ${color_1.strong(String(availableBranches.length))} found`;
            }
        }
        catch (e) {
            tasks.fail();
            throw e;
        }
        tasks.end();
        const choices = availableBranches.map(branch => ({
            name: branch.name,
            value: branch.name,
            checked: branch.name === 'master',
        }));
        if (choices.length === 0) {
            this.env.log.warn(`No branches found for the repository. Linking to ${color_1.input('master')} branch.`);
            return ['master'];
        }
        const selectedBranches = await this.env.prompt({
            type: 'checkbox',
            name: 'githubBranches',
            message: 'Which branch would you like to link?',
            choices,
            default: ['master'],
        });
        return selectedBranches;
    }
}
exports.LinkCommand = LinkCommand;
