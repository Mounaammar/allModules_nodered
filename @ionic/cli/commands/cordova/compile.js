"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompileCommand = void 0;
const cli_framework_1 = require("@ionic/cli-framework");
const color_1 = require("../../lib/color");
const utils_1 = require("../../lib/integrations/cordova/utils");
const base_1 = require("./base");
class CompileCommand extends base_1.CordovaCommand {
    async getMetadata() {
        return {
            name: 'compile',
            type: 'project',
            summary: 'Compile native platform code',
            description: `
Like running ${color_1.input('cordova compile')} directly, but provides friendly checks.
      `,
            exampleCommands: [
                'ios',
                'ios --device',
                'android',
            ],
            inputs: [
                {
                    name: 'platform',
                    summary: `The platform to compile (${['android', 'ios'].map(v => color_1.input(v)).join(', ')})`,
                    validators: [cli_framework_1.validators.required],
                },
            ],
            options: [
                ...base_1.CORDOVA_COMPILE_OPTIONS,
            ],
        };
    }
    async preRun(inputs, options, runinfo) {
        await this.preRunChecks(runinfo);
        if (!inputs[0]) {
            const platform = await this.env.prompt({
                type: 'input',
                name: 'platform',
                message: `What platform would you like to compile (${['android', 'ios'].map(v => color_1.input(v)).join(', ')}):`,
            });
            inputs[0] = platform.trim();
        }
        await this.checkForPlatformInstallation(inputs[0]);
    }
    async run(inputs, options) {
        const metadata = await this.getMetadata();
        await this.runCordova(utils_1.filterArgumentsForCordova(metadata, options), { stdio: 'inherit' });
    }
}
exports.CompileCommand = CompileCommand;
