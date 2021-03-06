"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSHBaseCommand = void 0;
const utils_subprocess_1 = require("@ionic/utils-subprocess");
const color_1 = require("../../lib/color");
const command_1 = require("../../lib/command");
const errors_1 = require("../../lib/errors");
class SSHBaseCommand extends command_1.Command {
    async checkForOpenSSH() {
        try {
            await this.env.shell.run('ssh', ['-V'], { stdio: 'ignore', showCommand: false, fatalOnNotFound: false });
        }
        catch (e) {
            if (!(e instanceof utils_subprocess_1.SubprocessError && e.code === utils_subprocess_1.ERROR_COMMAND_NOT_FOUND)) {
                throw e;
            }
            this.env.log.warn('OpenSSH not found on your computer.'); // TODO: more helpful message
            throw new errors_1.FatalException(`Command not found: ${color_1.strong('ssh')}`);
        }
    }
}
exports.SSHBaseCommand = SSHBaseCommand;
