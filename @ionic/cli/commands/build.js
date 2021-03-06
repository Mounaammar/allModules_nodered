"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildCommand = void 0;
const build_1 = require("../lib/build");
const color_1 = require("../lib/color");
const command_1 = require("../lib/command");
const errors_1 = require("../lib/errors");
class BuildCommand extends command_1.Command {
    async getMetadata() {
        const groups = [];
        const options = [];
        const footnotes = [];
        const exampleCommands = [''];
        let description = `${color_1.input('ionic build')} will perform an Ionic build, which compiles web assets and prepares them for deployment.`;
        const runner = this.project && await this.project.getBuildRunner();
        if (runner) {
            const libmetadata = await runner.getCommandMetadata();
            groups.push(...libmetadata.groups || []);
            options.push(...libmetadata.options || []);
            description += libmetadata.description ? `\n\n${libmetadata.description.trim()}` : '';
            footnotes.push(...libmetadata.footnotes || []);
            exampleCommands.push(...libmetadata.exampleCommands || []);
        }
        options.push(...build_1.COMMON_BUILD_COMMAND_OPTIONS);
        return {
            name: 'build',
            type: 'project',
            summary: 'Build web assets and prepare your app for any platform targets',
            description,
            footnotes,
            groups,
            exampleCommands,
            options,
        };
    }
    async preRun(inputs, options) {
        if (inputs.length > 0 && ['android', 'ios', 'wp8', 'windows', 'browser'].includes(inputs[0])) {
            this.env.log.warn(`${color_1.input('ionic build')} is for building web assets and takes no arguments. See ${color_1.input('ionic build --help')}.\n` +
                `Ignoring argument ${color_1.input(inputs[0])}. Perhaps you meant ${color_1.input('ionic cordova build ' + inputs[0])}?\n`);
            inputs.splice(0);
        }
    }
    async run(inputs, options, runinfo) {
        if (!this.project) {
            throw new errors_1.FatalException(`Cannot run ${color_1.input('ionic build')} outside a project directory.`);
        }
        try {
            const runner = await this.project.requireBuildRunner();
            const runnerOpts = runner.createOptionsFromCommandLine(inputs, options);
            await runner.run(runnerOpts);
        }
        catch (e) {
            if (e instanceof errors_1.RunnerException) {
                throw new errors_1.FatalException(e.message);
            }
            throw e;
        }
    }
}
exports.BuildCommand = BuildCommand;
