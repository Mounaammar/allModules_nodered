"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrepareCommand = void 0;
const color_1 = require("../../lib/color");
const errors_1 = require("../../lib/errors");
const utils_1 = require("../../lib/integrations/cordova/utils");
const base_1 = require("./base");
class PrepareCommand extends base_1.CordovaCommand {
    async getMetadata() {
        const options = [
            {
                name: 'build',
                summary: 'Do not invoke an Ionic build',
                type: Boolean,
                default: true,
            },
        ];
        const footnotes = [];
        const runner = this.project && await this.project.getBuildRunner();
        if (runner) {
            const libmetadata = await runner.getCommandMetadata();
            options.push(...libmetadata.options || []);
            footnotes.push(...libmetadata.footnotes || []);
        }
        return {
            name: 'prepare',
            type: 'project',
            summary: 'Copies assets to Cordova platforms, preparing them for native builds',
            description: `
${color_1.input('ionic cordova prepare')} will do the following:

- Perform an Ionic build, which compiles web assets to ${color_1.strong('www/')}.
- Copy the ${color_1.strong('www/')} directory into your Cordova platforms.
- Transform ${color_1.strong('config.xml')} into platform-specific manifest files.
- Copy icons and splash screens from ${color_1.strong('resources/')} to into your Cordova platforms.
- Copy plugin files into specified platforms.

You may wish to use ${color_1.input('ionic cordova prepare')} if you run your project with Android Studio or Xcode.
      `,
            footnotes,
            exampleCommands: ['', 'ios', 'android'],
            inputs: [
                {
                    name: 'platform',
                    summary: `The platform you would like to prepare (e.g. ${['android', 'ios'].map(v => color_1.input(v)).join(', ')})`,
                },
            ],
            options,
        };
    }
    async preRun(inputs, options, runinfo) {
        await this.preRunChecks(runinfo);
    }
    async run(inputs, options) {
        const { loadCordovaConfig } = await Promise.resolve().then(() => require('../../lib/integrations/cordova/config'));
        const { getPlatforms } = await Promise.resolve().then(() => require('../../lib/integrations/cordova/project'));
        const [platform] = inputs;
        if (!this.project) {
            throw new errors_1.FatalException(`Cannot run ${color_1.input('ionic cordova prepare')} outside a project directory.`);
        }
        if (platform) {
            await this.checkForPlatformInstallation(platform, {
                promptToInstall: true,
                promptToInstallRefusalMsg: (`Cannot prepare for ${color_1.input(platform)} unless the platform is installed.\n` +
                    `Did you mean just ${color_1.input('ionic cordova prepare')}?\n`),
            });
        }
        else {
            const conf = await loadCordovaConfig(this.integration);
            const platforms = await getPlatforms(this.integration.root);
            const configuredPlatforms = conf.getConfiguredPlatforms();
            if (configuredPlatforms.length === 0 && platforms.length === 0) {
                this.env.log.warn(`No platforms added to this project. Cannot prepare native platforms without any installed.\n` +
                    `Run ${color_1.input('ionic cordova platform add <platform>')} to add native platforms.`);
                throw new errors_1.FatalException('', 0);
            }
        }
        const metadata = await this.getMetadata();
        if (options.build) {
            const buildOptions = utils_1.generateOptionsForCordovaBuild(metadata, inputs, options);
            if (buildOptions['platform']) {
                try {
                    const runner = await this.project.requireBuildRunner();
                    const runnerOpts = runner.createOptionsFromCommandLine(inputs, buildOptions);
                    await runner.run(runnerOpts);
                }
                catch (e) {
                    if (e instanceof errors_1.RunnerException) {
                        throw new errors_1.FatalException(e.message);
                    }
                    throw e;
                }
            }
            else {
                this.env.log.warn(`Cannot perform Ionic build without ${color_1.input('platform')}. Falling back to just ${color_1.input('cordova prepare')}.\n` +
                    `Please supply a ${color_1.input('platform')} (e.g. ${['android', 'ios'].map(v => color_1.input(v)).join(', ')}) so the Ionic CLI can build web assets. The ${color_1.input('--no-build')} option will hide this warning.`);
                this.env.log.nl();
            }
        }
        await this.runCordova(utils_1.filterArgumentsForCordova(metadata, options), { stdio: 'inherit' });
    }
}
exports.PrepareCommand = PrepareCommand;
