"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenCommand = void 0;
const cli_framework_1 = require("@ionic/cli-framework");
const color_1 = require("../../lib/color");
const base_1 = require("./base");
class OpenCommand extends base_1.CapacitorCommand {
    async getMetadata() {
        return {
            name: 'open',
            type: 'project',
            summary: 'Open the IDE for a given native platform project',
            description: `
${color_1.input('ionic capacitor open')} will do the following:
- Open the IDE for your native project (Xcode for iOS, Android Studio for Android)
      `,
            inputs: [
                {
                    name: 'platform',
                    summary: `The platform to open (e.g. ${['android', 'ios'].map(v => color_1.input(v)).join(', ')})`,
                    validators: [cli_framework_1.validators.required],
                },
            ],
        };
    }
    async preRun(inputs, options, runinfo) {
        await this.preRunChecks(runinfo);
        if (!inputs[0]) {
            const platform = await this.env.prompt({
                type: 'list',
                name: 'platform',
                message: 'What platform would you like to open?',
                choices: ['android', 'ios'],
            });
            inputs[0] = platform.trim();
        }
        await this.checkForPlatformInstallation(inputs[0]);
    }
    async run(inputs, options) {
        const [platform] = inputs;
        const args = ['open'];
        if (platform) {
            args.push(platform);
        }
        await this.runCapacitor(args);
    }
}
exports.OpenCommand = OpenCommand;
