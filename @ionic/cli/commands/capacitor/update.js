"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCommand = void 0;
const color_1 = require("../../lib/color");
const base_1 = require("./base");
class UpdateCommand extends base_1.CapacitorCommand {
    async getMetadata() {
        return {
            name: 'update',
            type: 'project',
            summary: 'Update Capacitor native platforms, install Capacitor/Cordova plugins',
            description: `
${color_1.input('ionic capacitor update')} will do the following:
- Update Capacitor native platform(s) and dependencies
- Install any discovered Capacitor or Cordova plugins
      `,
            inputs: [
                {
                    name: 'platform',
                    summary: `The platform to update (e.g. ${['android', 'ios'].map(v => color_1.input(v)).join(', ')})`,
                },
            ],
        };
    }
    async preRun(inputs, options, runinfo) {
        await this.preRunChecks(runinfo);
        if (inputs[0]) {
            await this.checkForPlatformInstallation(inputs[0]);
        }
    }
    async run(inputs, options) {
        const [platform] = inputs;
        const args = ['update'];
        if (platform) {
            args.push(platform);
        }
        await this.runCapacitor(args);
    }
}
exports.UpdateCommand = UpdateCommand;
