"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpCommand = void 0;
const guards_1 = require("../guards");
const color_1 = require("../lib/color");
const command_1 = require("../lib/command");
class HelpCommand extends command_1.Command {
    async getMetadata() {
        return {
            name: 'help',
            type: 'global',
            summary: 'Provides help for a certain command',
            exampleCommands: ['start'],
            inputs: [
                {
                    name: 'command',
                    summary: 'The command you desire help with',
                },
            ],
            options: [
                {
                    name: 'json',
                    summary: 'Print help in JSON format',
                    type: Boolean,
                },
            ],
            groups: ["hidden" /* HIDDEN */],
        };
    }
    async run(inputs, options) {
        const { CommandSchemaHelpFormatter, CommandStringHelpFormatter, NamespaceSchemaHelpFormatter, NamespaceStringHelpFormatter } = await Promise.resolve().then(() => require('../lib/help'));
        const location = await this.namespace.locate(inputs);
        if (guards_1.isCommand(location.obj)) {
            const formatterOptions = { location, command: location.obj };
            const formatter = options['json'] ? new CommandSchemaHelpFormatter(formatterOptions) : new CommandStringHelpFormatter(formatterOptions);
            this.env.log.rawmsg(await formatter.format());
        }
        else {
            if (location.args.length > 0) {
                this.env.log.error(`Unable to find command: ${color_1.input(inputs.join(' '))}` +
                    (this.project ? '' : '\nYou may need to be in an Ionic project directory.'));
            }
            const now = new Date();
            const version = this.env.ctx.version;
            const suffix = now.getMonth() === 9 && now.getDate() === 31 ? ' 🎃' : '';
            const formatterOptions = {
                inProject: this.project ? true : false,
                version: version + suffix,
                location,
                namespace: location.obj,
            };
            const formatter = options['json'] ? new NamespaceSchemaHelpFormatter(formatterOptions) : new NamespaceStringHelpFormatter(formatterOptions);
            this.env.log.rawmsg(await formatter.format());
        }
    }
}
exports.HelpCommand = HelpCommand;
