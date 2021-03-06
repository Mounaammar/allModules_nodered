"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildCommand = void 0;
const cli_framework_1 = require("@ionic/cli-framework");
const color_1 = require("../../lib/color");
const errors_1 = require("../../lib/errors");
const hooks_1 = require("../../lib/hooks");
const utils_1 = require("../../lib/integrations/capacitor/utils");
const base_1 = require("./base");
class BuildCommand extends base_1.CapacitorCommand {
    async getMetadata() {
        const groups = ["beta" /* BETA */];
        const exampleCommands = [
            '',
            'android',
            'ios',
        ].sort();
        const options = [
            // Build Options
            {
                name: 'build',
                summary: 'Do not invoke Ionic build',
                type: Boolean,
                default: true,
            },
            {
                name: 'open',
                summary: 'Do not invoke Capacitor open',
                type: Boolean,
                default: true,
            },
        ];
        const footnotes = [
            {
                id: 'capacitor-native-config-docs',
                url: 'https://capacitor.ionicframework.com/docs/basics/configuring-your-app',
                shortUrl: 'https://ion.link/capacitor-native-config-docs',
            },
            {
                id: 'capacitor-ios-config-docs',
                url: 'https://capacitor.ionicframework.com/docs/ios/configuration',
                shortUrl: 'https://ion.link/capacitor-ios-config-docs',
            },
            {
                id: 'capacitor-android-config-docs',
                url: 'https://capacitor.ionicframework.com/docs/android/configuration',
                shortUrl: 'https://ion.link/capacitor-android-config-docs',
            },
        ];
        const buildRunner = this.project && await this.project.getBuildRunner();
        if (buildRunner) {
            const libmetadata = await buildRunner.getCommandMetadata();
            groups.push(...libmetadata.groups || []);
            options.push(...libmetadata.options || []);
            footnotes.push(...libmetadata.footnotes || []);
        }
        return {
            name: 'build',
            type: 'project',
            summary: 'Build an Ionic project for a given platform',
            description: `
${color_1.input('ionic capacitor build')} will do the following:
- Perform ${color_1.input('ionic build')}
- Copy web assets into the specified native platform
- Open the IDE for your native project (Xcode for iOS, Android Studio for Android)

Once the web assets and configuration are copied into your native project, you can build your app using the native IDE. Unfortunately, programmatically building the native project is not yet supported.

To configure your native project, see the common configuration docs[^capacitor-native-config-docs] as well as low-level configuration for iOS[^capacitor-ios-config-docs] and Android[^capacitor-android-config-docs].
      `,
            footnotes,
            exampleCommands,
            inputs: [
                {
                    name: 'platform',
                    summary: `The platform to build for (e.g. ${['android', 'ios'].map(v => color_1.input(v)).join(', ')})`,
                    validators: [cli_framework_1.validators.required],
                },
            ],
            options,
            groups,
        };
    }
    async preRun(inputs, options, runinfo) {
        await this.preRunChecks(runinfo);
        if (!inputs[0]) {
            const platform = await this.env.prompt({
                type: 'list',
                name: 'platform',
                message: 'What platform would you like to build for?',
                choices: ['android', 'ios'],
            });
            inputs[0] = platform.trim();
        }
        await this.checkForPlatformInstallation(inputs[0]);
    }
    async run(inputs, options) {
        if (!this.project) {
            throw new errors_1.FatalException(`Cannot run ${color_1.input('ionic capacitor build')} outside a project directory.`);
        }
        const [platform] = inputs;
        try {
            await this.runBuild(inputs, options);
        }
        catch (e) {
            if (e instanceof errors_1.RunnerException) {
                throw new errors_1.FatalException(e.message);
            }
            throw e;
        }
        await this.runCapacitor(['sync', platform]);
        const hookDeps = {
            config: this.env.config,
            project: this.project,
            shell: this.env.shell,
        };
        await this.runCapacitorBuildHook('capacitor:build:before', inputs, options, hookDeps);
        if (options['open']) {
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
            `To continue, build your project using ${utils_1.getNativeIDEForPlatform(platform)}!`);
    }
    async runCapacitorBuildHook(name, inputs, options, e) {
        const hook = new CapacitorBuildHook(name, e);
        const buildRunner = await e.project.requireBuildRunner();
        try {
            await hook.run({
                name: hook.name,
                build: buildRunner.createOptionsFromCommandLine(inputs, options),
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
exports.BuildCommand = BuildCommand;
class CapacitorBuildHook extends hooks_1.Hook {
    constructor(name, e) {
        super(e);
        this.name = name;
    }
}
