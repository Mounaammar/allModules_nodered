"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactServeCLI = exports.ReactServeRunner = void 0;
const utils_network_1 = require("@ionic/utils-network");
const utils_terminal_1 = require("@ionic/utils-terminal");
const color_1 = require("../../color");
const serve_1 = require("../../serve");
class ReactServeRunner extends serve_1.ServeRunner {
    constructor(e) {
        super();
        this.e = e;
    }
    async getCommandMetadata() {
        return {
            description: `
This command will convert options to the environment variables used by React Scripts. See the ${color_1.input('create-react-app')} docs[^cra-build-docs] for explanations.
      `,
            footnotes: [
                {
                    id: 'cra-build-docs',
                    url: 'https://facebook.github.io/create-react-app/docs/advanced-configuration',
                },
            ],
            options: [
                {
                    name: 'https',
                    summary: 'Use HTTPS for the dev server',
                    type: Boolean,
                    groups: ['cordova'],
                    hint: color_1.weak('[react-scripts]'),
                },
                {
                    name: 'react-editor',
                    summary: `Specify the editor that opens files upon crash`,
                    type: String,
                    spec: { value: 'editor' },
                    groups: ['cordova'],
                    hint: color_1.weak('[react-scripts]'),
                },
                {
                    name: 'ci',
                    summary: `Treat warnings as build failures, test runner does not watch`,
                    type: Boolean,
                    groups: ['cordova'],
                    hint: color_1.weak('[react-scripts]'),
                },
            ],
        };
    }
    createOptionsFromCommandLine(inputs, options) {
        const baseOptions = super.createOptionsFromCommandLine(inputs, options);
        const ci = options['ci'] ? Boolean(options['ci']) : undefined;
        const https = options['https'] ? Boolean(options['https']) : undefined;
        const reactEditor = options['react-editor'] ? String(options['react-editor']) : undefined;
        return {
            ...baseOptions,
            ci,
            https,
            reactEditor,
        };
    }
    modifyOpenUrl(url, options) {
        return url;
    }
    async serveProject(options) {
        const [externalIP, availableInterfaces] = await this.selectExternalIP(options);
        const port = options.port = await utils_network_1.findClosestOpenPort(options.port);
        const reactScripts = new ReactServeCLI(this.e);
        await reactScripts.serve(options);
        return {
            custom: reactScripts.resolvedProgram !== reactScripts.program,
            protocol: options.https ? 'https' : 'http',
            localAddress: 'localhost',
            externalAddress: externalIP,
            externalNetworkInterfaces: availableInterfaces,
            port,
            externallyAccessible: ![serve_1.BIND_ALL_ADDRESS, ...serve_1.LOCAL_ADDRESSES].includes(externalIP),
        };
    }
}
exports.ReactServeRunner = ReactServeRunner;
class ReactServeCLI extends serve_1.ServeCLI {
    constructor() {
        super(...arguments);
        this.name = 'React Scripts';
        this.pkg = 'react-scripts';
        this.program = 'react-scripts';
        this.prefix = 'react-scripts';
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
        const compileMsgs = ['Compiled successfully', 'Compiled with warnings', 'Failed to compile'];
        if (compileMsgs.some(msg => strippedLine.includes(msg))) {
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
        if (this.resolvedProgram === this.program) {
            return ['start'];
        }
        else {
            const [, ...pkgArgs] = await pkgManagerArgs(this.e.config.get('npmClient'), { command: 'run', script: this.script });
            return pkgArgs;
        }
    }
    async buildEnvVars(options) {
        const env = {};
        // Tell CRA not to open the dev server URL. We do this in Ionic CLI.
        env.BROWSER = 'none';
        // CRA binds to `localhost` by default, but if specified it prints a
        // warning, so don't set `HOST` if the host is set to `localhost`.
        if (options.host !== serve_1.DEFAULT_ADDRESS) {
            env.HOST = options.host;
        }
        env.PORT = String(options.port);
        env.HTTPS = options.https ? 'true' : 'false';
        if (options.ci) {
            env.CI = '1';
        }
        if (options.reactEditor) {
            env.REACT_EDITOR = options.reactEditor;
        }
        return { ...await super.buildEnvVars(options), ...env };
    }
}
exports.ReactServeCLI = ReactServeCLI;
