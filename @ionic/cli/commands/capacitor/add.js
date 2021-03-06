"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCommand = void 0;
const cli_framework_1 = require("@ionic/cli-framework");
const color_1 = require("../../lib/color");
const base_1 = require("./base");
class AddCommand extends base_1.CapacitorCommand {
    async getMetadata() {
        return {
            name: 'add',
            type: 'project',
            summary: 'Add a native platform to your Ionic project',
            description: `
${color_1.input('ionic capacitor add')} will do the following:
- Install the Capacitor platform package
- Copy the native platform template into your project
      `,
            inputs: [
                {
                    name: 'platform',
                    summary: `The platform to add (e.g. ${['android', 'ios'].map(v => color_1.input(v)).join(', ')})`,
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
                message: 'What platform would you like to add?',
                choices: ['android', 'ios'],
            });
            inputs[0] = platform.trim();
        }
    }
    async run(inputs, options) {
        const [platform] = inputs;
        await this.installPlatform(platform);
    }
}
exports.AddCommand = AddCommand;
