"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginCommand = void 0;
const cli_framework_1 = require("@ionic/cli-framework");
const color_1 = require("../../lib/color");
const errors_1 = require("../../lib/errors");
const utils_1 = require("../../lib/integrations/cordova/utils");
const npm_1 = require("../../lib/utils/npm");
const base_1 = require("./base");
class PluginCommand extends base_1.CordovaCommand {
    async getMetadata() {
        return {
            name: 'plugin',
            type: 'project',
            summary: 'Manage Cordova plugins',
            description: `
Like running ${color_1.input('cordova plugin')} directly, but provides friendly checks.
      `,
            exampleCommands: ['', 'add cordova-plugin-inappbrowser@latest', 'add phonegap-plugin-push --variable SENDER_ID=XXXXX', 'rm cordova-plugin-camera'],
            inputs: [
                {
                    name: 'action',
                    summary: `${color_1.input('add')} or ${color_1.input('remove')} a plugin; ${color_1.input('ls')} or ${color_1.input('save')} all project plugins`,
                },
                {
                    name: 'plugin',
                    summary: `The name of the plugin (corresponds to ${color_1.input('add')} and ${color_1.input('remove')})`,
                },
            ],
            options: [
                {
                    name: 'force',
                    summary: `Force overwrite the plugin if it exists (corresponds to ${color_1.input('add')})`,
                    type: Boolean,
                    groups: ["advanced" /* ADVANCED */, 'cordova', 'cordova-cli'],
                },
                {
                    name: 'variable',
                    summary: 'Specify plugin variables',
                    groups: ['cordova', 'cordova-cli'],
                    spec: { value: 'KEY=VALUE' },
                },
            ],
        };
    }
    async preRun(inputs, options, runinfo) {
        if (!this.project) {
            throw new errors_1.FatalException('Cannot use Cordova outside a project directory.');
        }
        const capacitor = this.project.getIntegration('capacitor');
        if (capacitor && capacitor.enabled) {
            const pkg = inputs[1] ? inputs[1] : '<package>';
            const installArgs = await npm_1.pkgManagerArgs(this.env.config.get('npmClient'), { command: 'install', pkg, save: false, saveExact: false });
            const uninstallArgs = await npm_1.pkgManagerArgs(this.env.config.get('npmClient'), { command: 'uninstall', pkg, save: false });
            throw new errors_1.FatalException(`Refusing to run ${color_1.input('ionic cordova plugin')} inside a Capacitor project.\n` +
                `In Capacitor projects, Cordova plugins are just regular npm dependencies.\n\n` +
                `- To add a plugin, use ${color_1.input(installArgs.join(' '))}\n` +
                `- To remove, use ${color_1.input(uninstallArgs.join(' '))}\n`);
        }
        await this.preRunChecks(runinfo);
        inputs[0] = !inputs[0] ? 'ls' : inputs[0];
        inputs[0] = (inputs[0] === 'rm') ? 'remove' : inputs[0];
        inputs[0] = (inputs[0] === 'list') ? 'ls' : inputs[0];
        cli_framework_1.validate(inputs[0], 'action', [cli_framework_1.contains(['add', 'remove', 'ls', 'save'], {})]);
        // If the action is list then lets just end here.
        if (['ls', 'save'].includes(inputs[0])) {
            await this.runCordova(['plugin', inputs[0]], {});
            throw new errors_1.FatalException('', 0);
        }
        if (!inputs[1]) {
            const plugin = await this.env.prompt({
                message: `What plugin would you like to ${inputs[0]}:`,
                type: 'input',
                name: 'plugin',
            });
            inputs[1] = plugin;
        }
        cli_framework_1.validate(inputs[1], 'plugin', [cli_framework_1.validators.required]);
    }
    async run(inputs, options) {
        const metadata = await this.getMetadata();
        const cordovaArgs = utils_1.filterArgumentsForCordova(metadata, options);
        await this.runCordova(cordovaArgs, {});
    }
}
exports.PluginCommand = PluginCommand;
