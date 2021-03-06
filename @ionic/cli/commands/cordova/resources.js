"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcesCommand = void 0;
const color_1 = require("../../lib/color");
const cordova_res_1 = require("../../lib/cordova-res");
const errors_1 = require("../../lib/errors");
const base_1 = require("./base");
class ResourcesCommand extends base_1.CordovaCommand {
    async getMetadata() {
        return {
            name: 'resources',
            type: 'project',
            summary: 'Automatically create icon and splash screen resources',
            description: `
Generate perfectly sized icons and splash screens from PNG source images for your Cordova platforms with this command.

The source image for icons should ideally be at least ${color_1.strong('1024×1024px')} and located at ${color_1.strong('resources/icon.png')}. The source image for splash screens should ideally be at least ${color_1.strong('2732×2732px')} and located at ${color_1.strong('resources/splash.png')}. If you used ${color_1.input('ionic start')}, there should already be default Ionic resources in the ${color_1.strong('resources/')} directory, which you can overwrite.

You can also generate platform-specific icons and splash screens by placing them in the respective ${color_1.strong('resources/<platform>/')} directory. For example, to generate an icon for Android, place your image at ${color_1.strong('resources/android/icon.png')}.

For best results, the splash screen's artwork should roughly fit within a square (${color_1.strong('1200×1200px')}) at the center of the image. You can use ${color_1.strong('https://code.ionicframework.com/resources/splash.psd')} as a template for your splash screen.

${color_1.input('ionic cordova resources')} will automatically update your ${color_1.strong('config.xml')} to reflect the changes in the generated images, which Cordova then configures.

This command uses the ${color_1.input('cordova-res')} utility[^cordova-res-repo] to generate resources locally.

Cordova reference documentation:
- Icons: ${color_1.strong('https://cordova.apache.org/docs/en/latest/config_ref/images.html')}
- Splash Screens: ${color_1.strong('https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-splashscreen/')}
      `,
            footnotes: [
                {
                    id: 'cordova-res-repo',
                    url: 'https://github.com/ionic-team/cordova-res',
                },
            ],
            exampleCommands: ['', ...cordova_res_1.SUPPORTED_PLATFORMS],
            inputs: [
                {
                    name: 'platform',
                    summary: `The platform for which you would like to generate resources (${cordova_res_1.SUPPORTED_PLATFORMS.map(v => color_1.input(v)).join(', ')})`,
                },
            ],
            options: [
                {
                    name: 'icon',
                    summary: 'Generate icon resources',
                    type: Boolean,
                    aliases: ['i'],
                },
                {
                    name: 'splash',
                    summary: 'Generate splash screen resources',
                    type: Boolean,
                    aliases: ['s'],
                },
            ],
        };
    }
    async run(inputs, options) {
        if (!this.project) {
            throw new errors_1.FatalException(`Cannot run ${color_1.input('ionic cordova resources')} outside a project directory.`);
        }
        if (options['cordova-res'] === false) {
            this.env.log.warn(`The ${color_1.input('--no-cordova-res')} option has been removed.\n` +
                `The Ionic image generation server has been shut down and the online resource generation flow no longer exists. Please migrate to ${color_1.strong('cordova-res')}${color_1.ancillary('[1]')}, the resource generation tool by Ionic that runs on your computer.\n\n` +
                `${color_1.ancillary('[1]')}: ${color_1.strong('https://github.com/ionic-team/cordova-res')}\n`);
        }
        const platform = inputs[0] ? String(inputs[0]) : undefined;
        await cordova_res_1.runCordovaRes(this.env, cordova_res_1.createCordovaResArgs({ platform }, options), { cwd: this.integration.root });
    }
}
exports.ResourcesCommand = ResourcesCommand;
