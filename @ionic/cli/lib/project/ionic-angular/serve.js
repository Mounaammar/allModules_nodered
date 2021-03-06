"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IonicAngularServeRunner = exports.DEFAULT_SERVE_SCRIPT_VALUE = void 0;
const cli_framework_1 = require("@ionic/cli-framework");
const string_1 = require("@ionic/cli-framework/utils/string");
const Debug = require("debug");
const color_1 = require("../../color");
const serve_1 = require("../../serve");
const common_1 = require("../common");
const app_scripts_1 = require("./app-scripts");
const debug = Debug('ionic:lib:project:ionic-angular:serve');
const DEFAULT_PROGRAM = 'ionic-app-scripts';
exports.DEFAULT_SERVE_SCRIPT_VALUE = `${DEFAULT_PROGRAM} serve`;
class IonicAngularServeRunner extends serve_1.ServeRunner {
    constructor(e) {
        super();
        this.e = e;
    }
    async getCommandMetadata() {
        return {
            options: [
                {
                    name: 'consolelogs',
                    summary: 'Print app console logs to Ionic CLI',
                    type: Boolean,
                    groups: ['cordova'],
                    aliases: ['c'],
                    hint: color_1.weak('[app-scripts]'),
                },
                {
                    name: 'serverlogs',
                    summary: 'Print dev server logs to Ionic CLI',
                    type: Boolean,
                    aliases: ['s'],
                    groups: ["hidden" /* HIDDEN */, 'cordova'],
                    hint: color_1.weak('[app-scripts]'),
                },
                {
                    name: 'livereload-port',
                    summary: 'Use specific port for live-reload',
                    default: serve_1.DEFAULT_LIVERELOAD_PORT.toString(),
                    aliases: ['r'],
                    groups: ["advanced" /* ADVANCED */, 'cordova'],
                    hint: color_1.weak('[app-scripts]'),
                    spec: { value: 'port' },
                },
                {
                    name: 'dev-logger-port',
                    summary: 'Use specific port for dev server',
                    default: serve_1.DEFAULT_DEV_LOGGER_PORT.toString(),
                    groups: ["advanced" /* ADVANCED */, 'cordova'],
                    hint: color_1.weak('[app-scripts]'),
                    spec: { value: 'port' },
                },
                {
                    name: 'proxy',
                    summary: 'Do not add proxies',
                    type: Boolean,
                    default: true,
                    groups: ["advanced" /* ADVANCED */, 'cordova'],
                    hint: color_1.weak('[app-scripts]'),
                },
                {
                    name: 'source-map',
                    summary: 'Output sourcemaps',
                    type: Boolean,
                    groups: ["advanced" /* ADVANCED */, 'cordova'],
                    hint: color_1.weak('[app-scripts]'),
                },
                ...app_scripts_1.APP_SCRIPTS_OPTIONS,
            ],
            exampleCommands: [
                '-c', '-- --enableLint false',
            ],
        };
    }
    createOptionsFromCommandLine(inputs, options) {
        const baseOptions = super.createOptionsFromCommandLine(inputs, options);
        const sourcemaps = typeof options['source-map'] === 'boolean' ? Boolean(options['source-map']) : undefined;
        const livereloadPort = string_1.str2num(options['livereload-port'], serve_1.DEFAULT_LIVERELOAD_PORT);
        const notificationPort = string_1.str2num(options['dev-logger-port'], serve_1.DEFAULT_DEV_LOGGER_PORT);
        return {
            ...baseOptions,
            sourcemaps,
            consolelogs: options['consolelogs'] ? true : false,
            serverlogs: options['serverlogs'] ? true : false,
            livereloadPort,
            notificationPort,
            env: options['env'] ? String(options['env']) : undefined,
        };
    }
    modifyOpenUrl(url, options) {
        return `${url}${options.browserOption ? options.browserOption : ''}${options.platform ? `?ionicplatform=${options.platform}` : ''}`;
    }
    async serveProject(options) {
        const [externalIP, availableInterfaces] = await this.selectExternalIP(options);
        const { port, livereloadPort, notificationPort } = await common_1.findOpenIonicPorts(options.host, options);
        options.port = port;
        options.livereloadPort = livereloadPort;
        options.notificationPort = notificationPort;
        const appscripts = new IonicAngularServeCLI(this.e);
        await appscripts.serve(options);
        return {
            custom: appscripts.resolvedProgram !== appscripts.program,
            protocol: 'http',
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
            ...options.livereloadPort ? [options.livereloadPort] : [],
            ...options.notificationPort ? [options.notificationPort] : [],
        ];
    }
}
exports.IonicAngularServeRunner = IonicAngularServeRunner;
class IonicAngularServeCLI extends serve_1.ServeCLI {
    constructor() {
        super(...arguments);
        this.name = 'Ionic App Scripts';
        this.pkg = '@ionic/app-scripts';
        this.program = DEFAULT_PROGRAM;
        this.prefix = 'app-scripts';
        this.script = serve_1.SERVE_SCRIPT;
    }
    stdoutFilter(line) {
        if (this.resolvedProgram !== this.program) {
            return super.stdoutFilter(line);
        }
        if (line.includes('server running')) {
            this.emit('ready');
            return false;
        }
        return true;
    }
    async buildArgs(options) {
        const { pkgManagerArgs } = await Promise.resolve().then(() => require('../../utils/npm'));
        const args = this.serveOptionsToAppScriptsArgs(options);
        if (this.resolvedProgram === this.program) {
            return ['serve', ...args];
        }
        else {
            const [, ...pkgArgs] = await pkgManagerArgs(this.e.config.get('npmClient'), { command: 'run', script: this.script, scriptArgs: [...args] });
            return pkgArgs;
        }
    }
    serveOptionsToAppScriptsArgs(options) {
        const args = {
            _: [],
            address: options.host,
            port: String(options.port),
            'livereload-port': String(options.livereloadPort),
            'dev-logger-port': String(options.notificationPort),
            consolelogs: options.consolelogs,
            serverlogs: options.serverlogs,
            nobrowser: true,
            nolivereload: !options.livereload,
            noproxy: !options.proxy,
            iscordovaserve: options.engine === 'cordova',
            generateSourceMap: typeof options.sourcemaps !== 'undefined' ? options.sourcemaps ? 'true' : 'false' : undefined,
            platform: options.platform,
            target: options.engine === 'cordova' ? 'cordova' : undefined,
            env: options.env,
        };
        return [...cli_framework_1.unparseArgs(args, { allowCamelCase: true, useEquals: false }), ...options['--']];
    }
    async resolveProgram() {
        if (typeof this.script !== 'undefined') {
            debug(`Looking for ${color_1.ancillary(this.script)} npm script.`);
            const pkg = await this.e.project.requirePackageJson();
            if (pkg.scripts && pkg.scripts[this.script]) {
                if (pkg.scripts[this.script] === exports.DEFAULT_SERVE_SCRIPT_VALUE) {
                    debug(`Found ${color_1.ancillary(this.script)}, but it is the default. Not running.`);
                }
                else {
                    debug(`Using ${color_1.ancillary(this.script)} npm script.`);
                    return this.e.config.get('npmClient');
                }
            }
        }
        return this.program;
    }
}
