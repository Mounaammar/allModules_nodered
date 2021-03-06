"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareCommand = void 0;
const color_1 = require("../lib/color");
const command_1 = require("../lib/command");
const errors_1 = require("../lib/errors");
class ShareCommand extends command_1.Command {
    async getMetadata() {
        return {
            name: 'share',
            type: 'global',
            summary: '',
            groups: ["hidden" /* HIDDEN */],
        };
    }
    async run() {
        const dashUrl = this.env.config.getDashUrl();
        throw new errors_1.FatalException(`${color_1.input('ionic share')} has been removed.\n` +
            `The functionality now exists in the Ionic Dashboard: ${color_1.strong(dashUrl)}`);
    }
}
exports.ShareCommand = ShareCommand;
