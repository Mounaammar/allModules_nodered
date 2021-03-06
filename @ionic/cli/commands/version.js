"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionCommand = void 0;
const command_1 = require("../lib/command");
class VersionCommand extends command_1.Command {
    async getMetadata() {
        return {
            name: 'version',
            type: 'global',
            summary: 'Returns the current CLI version',
            groups: ["hidden" /* HIDDEN */],
        };
    }
    async run(inputs, options) {
        // can't use logger--see https://github.com/ionic-team/ionic-cli/issues/2507
        process.stdout.write(this.env.ctx.version + '\n');
    }
}
exports.VersionCommand = VersionCommand;
