"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngularBuildCLI = exports.AngularBuildRunner = void 0;
const cli_framework_1 = require("@ionic/cli-framework");
const build_1 = require("../../build");
const color_1 = require("../../color");
const NG_BUILD_OPTIONS = [
    {
        name: 'configuration',
        aliases: ['c'],
        summary: 'Specify the configuration to use.',
        type: String,
        groups: ["advanced" /* ADVANCED */, 'cordova'],
        hint: color_1.weak('[ng]'),
        spec: { value: 'conf' },
    },
    {
        name: 'source-map',
        summary: 'Output source maps',
        type: Boolean,
        groups: ["advanced" /* ADVANCED */, 'cordova'],
        hint: color_1.weak('[ng]'),
    },
    {
        name: 'watch',
        summary: 'Rebuild when files change',
        type: Boolean,
        groups: ["advanced" /* ADVANCED */],
        hint: color_1.weak('[ng]'),
    },
];
class AngularBuildRunner extends build_1.BuildRunner {
    constructor(e) {
        super();
        this.e = e;
    }
    async getCommandMetadata() {
        return {
            description: `
${color_1.input('ionic build')} uses the Angular CLI. Use ${color_1.input('ng build --help')} to list all Angular CLI options for building your app. See the ${color_1.input('ng build')} docs[^ng-build-docs] for explanations. Options not listed below are considered advanced and can be passed to the ${color_1.input('ng')} CLI using the ${color_1.input('--')} separator after the Ionic CLI arguments. See the examples.
`,
            footnotes: [
                {
                    id: 'ng-build-docs',
                    url: 'https://angular.io/cli/build',
                },
            ],
            options: [
                {
                    name: 'prod',
                    summary: `Flag to use the ${color_1.input('production')} configuration`,
                    type: Boolean,
                    hint: color_1.weak('[ng]'),
                    groups: ['cordova'],
                },
                ...NG_BUILD_OPTIONS,
                {
                    name: 'cordova-assets',
                    summary: 'Do not bundle Cordova assets during Cordova build',
                    type: Boolean,
                    groups: ["hidden" /* HIDDEN */, 'cordova'],
                    default: true,
                },
            ],
            exampleCommands: [
                '--prod',
                '--watch',
            ],
        };
    }
    createOptionsFromCommandLine(inputs, options) {
        const baseOptions = super.createBaseOptionsFromCommandLine(inputs, options);
        const prod = options['prod'] ? Boolean(options['prod']) : undefined;
        const configuration = options['configuration'] ? String(options['configuration']) : (prod ? 'production' : undefined);
        const project = options['project'] ? String(options['project']) : 'app';
        const sourcemaps = typeof options['source-map'] === 'boolean' ? Boolean(options['source-map']) : undefined;
        const cordovaAssets = typeof options['cordova-assets'] === 'boolean' ? Boolean(options['cordova-assets']) : undefined;
        const watch = typeof options['watch'] === 'boolean' ? Boolean(options['watch']) : undefined;
        return {
            ...baseOptions,
            configuration,
            project,
            sourcemaps,
            cordovaAssets,
            watch,
            type: 'angular',
        };
    }
    async buildProject(options) {
        const ng = new AngularBuildCLI(this.e);
        await ng.build(options);
    }
}
exports.AngularBuildRunner = AngularBuildRunner;
class AngularBuildCLI extends build_1.BuildCLI {
    constructor() {
        super(...arguments);
        this.name = 'Angular CLI';
        this.pkg = '@angular/cli';
        this.program = 'ng';
        this.prefix = 'ng';
        this.script = build_1.BUILD_SCRIPT;
    }
    async buildArgs(options) {
        const { pkgManagerArgs } = await Promise.resolve().then(() => require('../../utils/npm'));
        const args = await this.buildOptionsToNgArgs(options);
        if (this.resolvedProgram === this.program) {
            return [...this.buildArchitectCommand(options), ...args];
        }
        else {
            const [, ...pkgArgs] = await pkgManagerArgs(this.e.config.get('npmClient'), { command: 'run', script: this.script, scriptArgs: [...args] });
            return pkgArgs;
        }
    }
    async buildOptionsToNgArgs(options) {
        const args = {
            _: [],
            'source-map': options.sourcemaps !== false ? options.sourcemaps : 'false',
            'cordova-assets': options.cordovaAssets !== false ? undefined : 'false',
            'watch': options.watch !== false ? options.watch : 'false',
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
        const cmd = options.engine === 'cordova' ? 'ionic-cordova-build' : 'build';
        return ['run', `${options.project}:${cmd}${options.configuration ? `:${options.configuration}` : ''}`];
    }
}
exports.AngularBuildCLI = AngularBuildCLI;
