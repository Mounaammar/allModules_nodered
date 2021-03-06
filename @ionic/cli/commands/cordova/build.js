"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildCommand = void 0;
const cli_framework_1 = require("@ionic/cli-framework");
const color_1 = require("../../lib/color");
const errors_1 = require("../../lib/errors");
const utils_1 = require("../../lib/integrations/cordova/utils");
const base_1 = require("./base");
class BuildCommand extends base_1.CordovaCommand {
    async getMetadata() {
        const exampleCommands = base_1.CORDOVA_BUILD_EXAMPLE_COMMANDS.sort();
        const options = [
            // Build Options
            {
                name: 'build',
                summary: 'Do not invoke an Ionic build',
                type: Boolean,
                default: true,
            },
            ...base_1.CORDOVA_COMPILE_OPTIONS,
        ];
        const footnotes = [
            {
                id: 'cordova-android-using-flags',
                url: 'https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#using-flags',
            },
            {
                id: 'cordova-ios-using-flags',
                url: 'https://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html#using-flags',
            },
        ];
        const runner = this.project && await this.project.getBuildRunner();
        if (runner) {
            const libmetadata = await runner.getCommandMetadata();
            options.push(...(libmetadata.options || []).filter(o => o.groups && o.groups.includes('cordova')));
            footnotes.push(...libmetadata.footnotes || []);
        }
        return {
            name: 'build',
            type: 'project',
            summary: 'Build (prepare + compile) an Ionic project for a given platform',
            description: `
Like running ${color_1.input('cordova build')} directly, but also builds web assets with configuration from ${color_1.input('ionic build')} and provides friendly checks.

To pass additional options to the Cordova CLI, use the ${color_1.input('--')} separator after the Ionic CLI arguments.

The Cordova CLI requires a separator for platform-specific arguments for Android builds[^cordova-android-using-flags], so an additional separator is required for the Ionic CLI, but it is not required for iOS builds[^cordova-ios-using-flags]. See the example commands for usage with separators. To avoid using flags, consider using ${color_1.input('--buildConfig')} with a ${color_1.strong('build.json')} file.
      `,
            footnotes,
            exampleCommands,
            inputs: [
                {
                    name: 'platform',
                    summary: `The platform to build (e.g. ${['android', 'ios'].map(v => color_1.input(v)).join(', ')})`,
                    validators: [cli_framework_1.validators.required],
                },
            ],
            options,
        };
    }
    async preRun(inputs, options, runinfo) {
        await this.preRunChecks(runinfo);
        if (!inputs[0]) {
            const platform = await this.env.prompt({
                type: 'input',
                name: 'platform',
                message: `What platform would you like to build (${['android', 'ios'].map(v => color_1.input(v)).join(', ')}):`,
            });
            inputs[0] = platform.trim();
        }
        await this.checkForPlatformInstallation(inputs[0]);
    }
    async run(inputs, options) {
        const metadata = await this.getMetadata();
        if (!this.project) {
            throw new errors_1.FatalException(`Cannot run ${color_1.input('ionic cordova build')} outside a project directory.`);
        }
        if (options.build) {
            try {
                const runner = await this.project.requireBuildRunner();
                const runnerOpts = runner.createOptionsFromCommandLine(inputs, utils_1.generateOptionsForCordovaBuild(metadata, inputs, options));
                await runner.run(runnerOpts);
            }
            catch (e) {
                if (e instanceof errors_1.RunnerException) {
                    throw new errors_1.FatalException(e.message);
                }
                throw e;
            }
        }
        const cordovaArgs = utils_1.filterArgumentsForCordova(metadata, options);
        await this.runCordova(cordovaArgs, { stdio: 'inherit' });
    }
}
exports.BuildCommand = BuildCommand;
