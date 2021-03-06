"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunCommand = void 0;
const cli_framework_1 = require("@ionic/cli-framework");
const utils_process_1 = require("@ionic/utils-process");
const utils_terminal_1 = require("@ionic/utils-terminal");
const chalk = require("chalk");
const Debug = require("debug");
const lodash = require("lodash");
const semver = require("semver");
const constants_1 = require("../../constants");
const color_1 = require("../../lib/color");
const errors_1 = require("../../lib/errors");
const hooks_1 = require("../../lib/hooks");
const utils_1 = require("../../lib/integrations/capacitor/utils");
const serve_1 = require("../../lib/serve");
const base_1 = require("./base");
const debug = Debug('ionic:commands:capacitor:run');
const PLATFORMS = ['android', 'ios'];
class RunCommand extends base_1.CapacitorCommand {
    constructor() {
        super(...arguments);
        this.isOldCapacitor = lodash.memoize(async () => {
            const version = await this.getCapacitorVersion();
            return semver.lt(version, '3.0.0-alpha.7');
        });
        this.getNativeTargets = lodash.memoize(async (platform) => {
            const args = ['run', platform, '--list', '--json'];
            debug('Getting native targets for %O with Capacitor CLI: %O', platform, args);
            const output = await this.env.shell.cmdinfo('capacitor', args, { cwd: this.integration.root });
            if (!output) {
                return [];
            }
            const targets = JSON.parse(output);
            debug('%O native targets found', targets.length);
            return targets;
        });
    }
    async getMetadata() {
        const groups = ["beta" /* BETA */];
        const exampleCommands = [
            '',
            'android',
            'android -l --external',
            'ios --livereload --external',
            'ios --livereload-url=http://localhost:8100',
        ].sort();
        let options = [
            {
                name: 'list',
                summary: 'List all available targets',
                type: Boolean,
                groups: ['capacitor', 'native-run'],
                hint: color_1.weak('[capacitor]'),
            },
            {
                name: 'target',
                summary: `Deploy to a specific device by its ID (use ${color_1.input('--list')} to see all)`,
                type: String,
                groups: ['capacitor', 'native-run'],
                hint: color_1.weak('[capacitor]'),
            },
            {
                name: 'open',
                summary: `Open native IDE instead of using ${color_1.input('capacitor run')}`,
                type: Boolean,
            },
            // Build Options
            {
                name: 'build',
                summary: 'Do not invoke Ionic build',
                type: Boolean,
                default: true,
            },
            // Serve Options
            ...serve_1.COMMON_SERVE_COMMAND_OPTIONS.filter(o => !['livereload'].includes(o.name)).map(o => ({ ...o, hint: color_1.weak('(--livereload)') })),
            {
                name: 'livereload',
                summary: 'Spin up dev server to live-reload www files',
                type: Boolean,
                aliases: ['l'],
            },
            {
                name: 'livereload-url',
                summary: 'Provide a custom URL to the dev server',
                spec: { value: 'url' },
            },
        ];
        const footnotes = [
            {
                id: 'remote-debugging-docs',
                url: 'https://ionicframework.com/docs/developer-resources/developer-tips',
                shortUrl: 'https://ion.link/remote-debugging-docs',
            },
            {
                id: 'livereload-docs',
                url: 'https://ionicframework.com/docs/cli/livereload',
                shortUrl: 'https://ion.link/livereload-docs',
            },
        ];
        const serveRunner = this.project && await this.project.getServeRunner();
        const buildRunner = this.project && await this.project.getBuildRunner();
        if (buildRunner) {
            const libmetadata = await buildRunner.getCommandMetadata();
            groups.push(...libmetadata.groups || []);
            options.push(...libmetadata.options || []);
            footnotes.push(...libmetadata.footnotes || []);
        }
        if (serveRunner) {
            const libmetadata = await serveRunner.getCommandMetadata();
            const existingOpts = options.map(o => o.name);
            groups.push(...libmetadata.groups || []);
            const runnerOpts = (libmetadata.options || [])
                .filter(o => !existingOpts.includes(o.name))
                .map(o => ({ ...o, hint: `${o.hint ? `${o.hint} ` : ''}${color_1.weak('(--livereload)')}` }));
            options = lodash.uniqWith([...runnerOpts, ...options], (optionA, optionB) => optionA.name === optionB.name);
            footnotes.push(...libmetadata.footnotes || []);
        }
        return {
            name: 'run',
            type: 'project',
            summary: 'Run an Ionic project on a connected device',
            description: `
${color_1.input('ionic capacitor run')} will do the following:
- Perform ${color_1.input('ionic build')} (or run the dev server from ${color_1.input('ionic serve')} with the ${color_1.input('--livereload')} option)
- Run ${color_1.input('capacitor run')} (or open IDE for your native project with the ${color_1.input('--open')} option)

When using ${color_1.input('--livereload')} with hardware devices, remember that livereload needs an active connection between device and computer. In some scenarios, you may need to host the dev server on an external address using the ${color_1.input('--external')} option. See these docs[^livereload-docs] for more information.

If you have multiple devices and emulators, you can target a specific one by ID with the ${color_1.input('--target')} option. You can list targets with ${color_1.input('--list')}.

For Android and iOS, you can setup Remote Debugging on your device with browser development tools using these docs[^remote-debugging-docs].
      `,
            footnotes,
            exampleCommands,
            inputs: [
                {
                    name: 'platform',
                    summary: `The platform to run (e.g. ${PLATFORMS.map(v => color_1.input(v)).join(', ')})`,
                    validators: [cli_framework_1.validators.required],
                },
            ],
            options,
            groups,
        };
    }
    async preRun(inputs, options, runinfo) {
        await this.preRunChecks(runinfo);
        if (await this.isOldCapacitor()) {
            this.env.log.warn(`Support for Capacitor 1 and 2 is deprecated.\n` +
                `Please update to the latest Capacitor. Visit the docs${color_1.ancillary('[1]')} for upgrade guides.\n\n` +
                `${color_1.ancillary('[1]')}: ${color_1.strong('https://capacitorjs.com/docs/')}\n`);
            if (options['list']) {
                throw new errors_1.FatalException(`The ${color_1.input('--list')} option is not supported with your Capacitor version.`);
            }
            if (options['target']) {
                throw new errors_1.FatalException(`The ${color_1.input('--target')} option is not supported with your Capacitor version.`);
            }
        }
        if (!inputs[0]) {
            const platform = await this.env.prompt({
                type: 'list',
                name: 'platform',
                message: options['list'] ? 'What platform targets would you like to list?' : 'What platform would you like to run?',
                choices: PLATFORMS,
            });
            inputs[0] = platform.trim();
        }
        if (options['livereload-url']) {
            options['livereload'] = true;
        }
        if (!options['build'] && options['livereload']) {
            this.env.log.warn(`No livereload with ${color_1.input('--no-build')}.`);
            options['livereload'] = false;
        }
        await this.checkForPlatformInstallation(inputs[0]);
        if (!(await this.isOldCapacitor())) {
            const targets = inputs[0] ? await this.getNativeTargets(inputs[0]) : [];
            if (options['list']) {
                if (!inputs[0]) {
                    throw new errors_1.FatalException(`The ${color_1.input('platform')} argument is required for the ${color_1.input('--list')} option.`);
                }
                if (targets.length > 0) {
                    const rows = targets.map(t => [t.name, t.api, t.id]);
                    this.env.log.msg(utils_terminal_1.columnar(rows, { ...constants_1.COLUMNAR_OPTIONS, headers: ['Name', 'API', 'Target ID'] }));
                }
                else {
                    this.env.log.info('No native targets found.');
                }
                throw new errors_1.FatalException('', 0);
            }
            if (!options['open']) {
                const target = options['target'];
                if (typeof target === 'string') {
                    if (!targets.map(t => t.id).find(t => t === target)) {
                        throw new errors_1.FatalException(`${color_1.input(target)} is not a valid Target ID.\n` +
                            `Use the ${color_1.input('--list')} option to list all targets.\n`);
                    }
                }
                else {
                    options['target'] = await this.env.prompt({
                        type: 'list',
                        name: 'target',
                        message: 'Which device would you like to target?',
                        choices: targets.map(t => ({ name: `${t.name} (${t.id})`, value: t.id })),
                    });
                    if (!inputs[0]) {
                        throw new errors_1.FatalException(`The ${color_1.input('platform')} argument is required.`);
                    }
                    if (!options['target']) {
                        throw new errors_1.FatalException(`The ${color_1.input('--target')} option is required.`);
                    }
                }
            }
        }
    }
    async run(inputs, options) {
        if (!this.project) {
            throw new errors_1.FatalException(`Cannot run ${color_1.input('ionic capacitor run')} outside a project directory.`);
        }
        const [platform] = inputs;
        const doLiveReload = !!options['livereload'];
        const doOpenFlow = (await this.isOldCapacitor()) || options['open'] === true;
        if (doLiveReload) {
            await this.runCapacitor(['sync', platform]);
            await this.runServe(inputs, options);
            if (doOpenFlow) {
                await this.runCapacitorOpenFlow(inputs, options);
                this.env.log.nl();
                this.env.log.info('Development server will continue running until manually stopped.\n' +
                    chalk.yellow('Use Ctrl+C to quit this process'));
            }
            else {
                await this.runCapacitorRunFlow(inputs, options, { shouldSync: false });
                this.env.log.nl();
                this.env.log.info(`App deployed to device!\n` +
                    'Development server will continue running until manually stopped.\n\n' +
                    chalk.yellow('Use Ctrl+C to quit this process'));
            }
            await utils_process_1.sleepForever();
        }
        else {
            await this.runBuild(inputs, options);
            if (doOpenFlow) {
                await this.runCapacitor(['sync', platform]);
                await this.runCapacitorOpenFlow(inputs, options);
            }
            else {
                await this.runCapacitorRunFlow(inputs, options, { shouldSync: true });
            }
        }
    }
    async runCapacitorOpenFlow(inputs, options) {
        if (!this.project) {
            throw new errors_1.FatalException(`Cannot run ${color_1.input('ionic capacitor run')} outside a project directory.`);
        }
        const [platform] = inputs;
        await this.runCapacitorRunHook('capacitor:run:before', inputs, options, { ...this.env, project: this.project });
        if (options['open'] !== false) {
            this.env.log.nl();
            this.env.log.info(this.getContinueMessage(platform));
            this.env.log.nl();
            await this.runCapacitor(['open', platform]);
        }
    }
    getContinueMessage(platform) {
        if (platform === 'electron') {
            return 'Ready to be used in Electron!';
        }
        return ('Ready for use in your Native IDE!\n' +
            `To continue, run your project on a device or ${utils_1.getVirtualDeviceNameForPlatform(platform)} using ${utils_1.getNativeIDEForPlatform(platform)}!`);
    }
    async runCapacitorRunFlow(inputs, options, { shouldSync = true } = {}) {
        if (!this.project) {
            throw new errors_1.FatalException(`Cannot run ${color_1.input('ionic capacitor run')} outside a project directory.`);
        }
        const [platform] = inputs;
        await this.runCapacitorRunHook('capacitor:run:before', inputs, options, { ...this.env, project: this.project });
        await this.runCapacitor(['run', platform, ...(shouldSync ? [] : ['--no-sync']), '--target', String(options['target'])]);
    }
    async runCapacitorRunHook(name, inputs, options, e) {
        const hook = new CapacitorRunHook(name, e);
        let serveOptions;
        let buildOptions;
        if (options['livereload']) {
            const serveRunner = await e.project.requireServeRunner();
            serveOptions = serveRunner.createOptionsFromCommandLine(inputs, options);
        }
        else {
            const buildRunner = await e.project.requireBuildRunner();
            buildOptions = buildRunner.createOptionsFromCommandLine(inputs, options);
        }
        try {
            await hook.run({
                name: hook.name,
                serve: serveOptions,
                build: buildOptions,
                capacitor: await this.createOptionsFromCommandLine(inputs, options),
            });
        }
        catch (e) {
            if (e instanceof cli_framework_1.BaseError) {
                throw new errors_1.FatalException(e.message);
            }
            throw e;
        }
    }
}
exports.RunCommand = RunCommand;
class CapacitorRunHook extends hooks_1.Hook {
    constructor(name, e) {
        super(e);
        this.name = name;
    }
}
