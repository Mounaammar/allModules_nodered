"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitRemoteCommand = void 0;
const color_1 = require("../../lib/color");
const command_1 = require("../../lib/command");
const errors_1 = require("../../lib/errors");
class GitRemoteCommand extends command_1.Command {
    async getMetadata() {
        const dashUrl = this.env.config.getDashUrl();
        return {
            name: 'remote',
            type: 'project',
            groups: ["paid" /* PAID */],
            summary: 'Adds/updates the Ionic Appflow git remote to your local Ionic app',
            description: `
This command is used by ${color_1.input('ionic link')} when Ionic Appflow is used as the git host.

${color_1.input('ionic git remote')} will check the local repository for whether or not the git remote is properly set up. This command operates on the ${color_1.strong('ionic')} remote. For advanced configuration, see ${color_1.strong('Settings')} => ${color_1.strong('Git')} in the app settings of the Dashboard[^dashboard].
      `,
            footnotes: [
                {
                    id: 'dashboard',
                    url: dashUrl,
                },
            ],
        };
    }
    async run(inputs, options) {
        const { AppClient } = await Promise.resolve().then(() => require('../../lib/app'));
        const { addIonicRemote, getIonicRemote, initializeRepo, isRepoInitialized, setIonicRemote } = await Promise.resolve().then(() => require('../../lib/git'));
        if (!this.project) {
            throw new errors_1.FatalException(`Cannot run ${color_1.input('ionic git remote')} outside a project directory.`);
        }
        const token = await this.env.session.getUserToken();
        const id = await this.project.requireAppflowId();
        const appClient = new AppClient(token, this.env);
        const app = await appClient.load(id);
        if (!app.repo_url) {
            throw new errors_1.FatalException(`Missing ${color_1.strong('repo_url')} property in app.`);
        }
        if (!(await isRepoInitialized(this.project.directory))) {
            await initializeRepo({ shell: this.env.shell }, this.project.directory);
            this.env.log.warn(`Initializing a git repository for your project.\n` +
                `Before your first ${color_1.input('git push ionic master')}, you'll want to commit all the files in your project:\n\n` +
                `${color_1.input('git commit -a -m "Initial commit"')}\n`);
        }
        const remote = app.repo_url;
        const found = await getIonicRemote({ shell: this.env.shell }, this.project.directory);
        if (found) {
            if (remote === found) {
                this.env.log.msg(`Existing remote ${color_1.strong('ionic')} found.`);
            }
            else {
                await setIonicRemote({ shell: this.env.shell }, this.project.directory, remote);
                this.env.log.ok(`Updated remote ${color_1.strong('ionic')}.`);
            }
        }
        else {
            await addIonicRemote({ shell: this.env.shell }, this.project.directory, remote);
            this.env.log.ok(`Added remote ${color_1.strong('ionic')}.`);
        }
    }
}
exports.GitRemoteCommand = GitRemoteCommand;
