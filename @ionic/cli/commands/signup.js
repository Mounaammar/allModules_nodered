"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignupCommand = void 0;
const command_1 = require("../lib/command");
const open_1 = require("../lib/open");
class SignupCommand extends command_1.Command {
    async getMetadata() {
        return {
            name: 'signup',
            type: 'global',
            summary: 'Create an Ionic account',
            description: `
If you are having issues signing up, please get in touch with our Support[^support-request].
      `,
            footnotes: [
                {
                    id: 'support-request',
                    url: 'https://ion.link/support-request',
                },
            ],
        };
    }
    async run(inputs, options) {
        const dashUrl = this.env.config.getDashUrl();
        await open_1.openUrl(`${dashUrl}/signup?source=cli`);
        this.env.log.ok('Launched signup form in your browser!');
    }
}
exports.SignupCommand = SignupCommand;
