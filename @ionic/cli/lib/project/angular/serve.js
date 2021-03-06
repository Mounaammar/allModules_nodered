"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngularServeCLI = exports.AngularServeRunner = void 0;
const cli_framework_1 = require("@ionic/cli-framework");
const string_1 = require("@ionic/cli-framework/utils/string");
const utils_network_1 = require("@ionic/utils-network");
const utils_terminal_1 = require("@ionic/utils-terminal");
const chalk = require("chalk");
const color_1 = require("../../color");
const serve_1 = require("../../serve");
class AngularServeRunner extends serve_1.ServeRunner {
    constructor(e) {
        super();
        this.e = e;
    }
    async getCommandMetadata() {
        return {
            description: `
${color_1.input('ionic serve')} uses the Angular CLI. Use ${color_1.input('ng serve --help')} to list all Angular CLI options for serving your app. See the ${color_1.input('ng serve')} docs[^ng-serve-docs] for explanations. Options not listed below are considered advanced and can be passed to the Angular CLI using the ${color_1.input('--')} separator after the Ionic CLI arguments. See the examples.

The dev server can use HTTPS via the ${color_1.input('--ssl')} option ${chalk.bold.red('(experimental)')}. There are several known issues with HTTPS. See issue #3305[^issue-3305].
`,
            footnotes: [
                {
                    id: 'ng-serve-docs',
                    url: 'https://angular.io/cli/serve',
                },
                {
                    id: 'issue-3305',
                    url: 'https://github.com/ionic-team/ionic-cli/issues/3305',
                },
            ],
            options: [
                {
                    name: 'consolelogs',
                    summary: 'Print app console logs to the terminal',
                    type: Boolean,
                    groups: ["advanced" /* ADVANCED */, 'cordova'],
                    hint: color_1.weak('[ng]'),
                },
                {
                    name: 'consolelogs-port',
                    summary: 'Use specific port for console logs server',
                    type: String,
                    groups: ["advanced" /* ADVANCED */, 'cordova'],
                    hint: color_1.weak('[ng]'),
                    spec: { value: 'port' },
                },
                {
                    name: 'ssl',
                    summary: 'Use HTTPS for the dev server',
                    type: Boolean,
                    groups: ["experimental" /* EXPERIMENTAL */, 'cordova'],
                    hint: color_1.weak('[ng]'),
                },
                {
                    name: 'prod',
                    summary: `Flag to use the ${color_1.input('production')} configuration`,
                    type: Boolean,
                    groups: ['cordova'],
                    hint: color_1.weak('[ng]'),
                },
                {
                    name: 'configuration',
                    summary: 'Specify the configuration to use.',
                    type: String,
                    groups: ["advanced" /* ADVANCED */, 'cordova'],
                    aliases: ['c'],
                    hint: color_1.weak('[ng]'),
                    spec: { value: 'conf' },
                },
                {
                    name: 'source-map',
                    summary: 'Output sourcemaps',
                    type: Boolean,
                    groups: ["advanced" /* ADVANCED */, 'cordova'],
                    hint: color_1.weak('[ng]'),
                },
            ],
            exampleCommands: [
                '-- --proxy-config proxy.conf.json',
            ],
        };
    }
    createOptionsFromCommandLine(inputs, options) {
        const baseOptions = super.createOptionsFromCommandLine(inputs, options);
        const prod = options['prod'] ? Boolean(options['prod']) : undefined;
        const ssl = options['ssl'] ? Boolean(options['ssl']) : undefined;
        const configuration = options['configuration'] ? String(options['configuration']) : (prod ? 'production' : undefined);
        const project = options['project'] ? String(options['project']) : 'app';
        const sourcemaps = typeof options['source-map'] === 'boolean' ? Boolean(options['source-map']) : undefined;
        const consolelogs = typeof options['consolelogs'] === 'boolean' ? Boolean(options['consolelogs']) : undefined;
        const consolelogsPort = consolelogs ? string_1.str2num(options['consolelogs-port'], serve_1.DEFAULT_DEV_LOGGER_PORT) : undefined;
        return {
            ...baseOptions,
            consolelogs,
            consolelogsPort,
            ssl,
            configuration,
            project,
            sourcemaps,
        };
    }
    platformToMode(platform) {
        if (platform === 'ios') {
            return 'ios';
        }
        return 'md';
    }
    modifyOpenUrl(url, options) {
        return `${url}${options.browserOption ? options.browserOption : ''}${options.platform ? `?ionic:mode=${this.platformToMode(options.platform)}&ionic:persistConfig=true` : ''}`;
    }
    async serveProject(options) {
        const [externalIP, availableInterfaces] = await this.selectExternalIP(options);
        const port = options.port = await utils_network_1.findClosestOpenPort(options.port);
        const ng = new AngularServeCLI(this.e);
        await ng.serve(options);
        return {
            custom: ng.resolvedProgram !== ng.program,
            protocol: options.ssl ? 'https' : 'http',
            localAddress: 'localhost',
            externalAddress: externalIP,
            externalNetworkInterfaces: availableInterfaces,
            port,
            externallyAccessible: ![serve_1.BIND_ALL_ADDRESS, ...serve_1.LOCAL_ADDRESSES].includes(externalIP),
        };
    }
    getUsedPorts(options, details) {
        return [
            ...super.getUsedPorts(options, details),
            ...options.consolelogsPort ? [options.consolelogsPort] : [],
        ];
    }
}
exports.AngularServeRunner = AngularServeRunner;
class AngularServeCLI extends serve_1.ServeCLI {
    constructor() {
        super(...arguments);
        this.name = 'Angular CLI';
        this.pkg = '@angular/cli';
        this.program = 'ng';
        this.prefix = 'ng';
        this.script = serve_1.SERVE_SCRIPT;
        this.chunks = 0;
    }
    async serve(options) {
        this.on('compile', chunks => {
            if (chunks > 0) {
                this.e.log.info(`... and ${color_1.strong(chunks.toString())} additional chunks`);
            }
        });
        return super.serve(options);
    }
    stdoutFilter(line) {
        if (this.resolvedProgram !== this.program) {
            return super.stdoutFilter(line);
        }
        const strippedLine = utils_terminal_1.stripAnsi(line);
        if (strippedLine.includes('Development Server is listening')) {
            this.emit('ready');
            return false;
        }
        if (strippedLine.match(/.*chunk\s{\d+}.+/)) {
            this.chunks++;
            return false;
        }
        if (strippedLine.includes('Compiled successfully')) {
            this.emit('compile', this.chunks);
            this.chunks = 0;
        }
        return true;
    }
    async buildArgs(options) {
        const { pkgManagerArgs } = await Promise.resolve().then(() => require('../../utils/npm'));
        const args = await this.serveOptionsToNgArgs(options);
        if (this.resolvedProgram === this.program) {
            return [...this.buildArchitectCommand(options), ...args];
        }
        else {
            const [, ...pkgArgs] = await pkgManagerArgs(this.e.config.get('npmClient'), { command: 'run', script: this.script, scriptArgs: [...args] });
            return pkgArgs;
        }
    }
    async serveOptionsToNgArgs(options) {
        const args = {
            _: [],
            host: options.host,
            port: options.port ? options.port.toString() : undefined,
            'source-map': options.sourcemaps !== false ? options.sourcemaps : 'false',
            'ssl': options.ssl !== false ? options.ssl : 'false',
        };
        const projectArgs = [];
        let separatedArgs = options['--'];
        if (options.engine === 'cordova') {
            const integration = this.e.project.requireIntegration('cordova');
            args.platform = options.platform;
            if (this.e.project.rootDirectory !== integration.root) {
                args.cordovaBasePath = integration.root;
            }
            separatedArgs = [];
            args.consolelogs = options.consolelogs ? true : undefined;
            args['consolelogs-port'] = options.consolelogsPort ? String(options.consolelogsPort) : undefined;
        }
        else {
            args['public-host'] = options.publicHost; // TODO: @ionic/angular-toolkit would need to support --public-host
        }
        if (this.resolvedProgram !== this.program) {
            if (options.configuration) {
                projectArgs.push(`--configuration=${options.configuration}`);
            }
            if (options.project) {
                projectArgs.push(`--project=${options.project}`);
            }
        }
        if (options.verbose) {
            projectArgs.push('--verbose');
        }
        return [...cli_framework_1.unparseArgs(args), ...projectArgs, ...separatedArgs];
    }
    buildArchitectCommand(options) {
        const cmd = options.engine === 'cordova' ? 'ionic-cordova-serve' : 'serve';
        return ['run', `${options.project}:${cmd}${options.configuration ? `:${options.configuration}` : ''}`];
    }
}
exports.AngularServeCLI = AngularServeCLI;
