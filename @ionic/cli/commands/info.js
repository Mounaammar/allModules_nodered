"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoCommand = void 0;
const string_1 = require("@ionic/cli-framework/utils/string");
const utils_terminal_1 = require("@ionic/utils-terminal");
const lodash = require("lodash");
const color_1 = require("../lib/color");
const command_1 = require("../lib/command");
const INFO_GROUPS = ['ionic', 'capacitor', 'cordova', 'utility', 'system', 'environment'];
class InfoCommand extends command_1.Command {
    async getMetadata() {
        return {
            name: 'info',
            type: 'global',
            summary: 'Print project, system, and environment information',
            description: `
This command is an easy way to share information about your setup. If applicable, be sure to run ${color_1.input('ionic info')} within your project directory to display even more information.
      `,
            options: [
                {
                    name: 'json',
                    summary: 'Print system/environment info in JSON format',
                    type: Boolean,
                },
            ],
        };
    }
    async run(inputs, options) {
        const { json } = options;
        const items = (await this.env.getInfo()).filter(item => item.hidden !== true);
        if (json) {
            process.stdout.write(JSON.stringify(items));
        }
        else {
            const groupedInfo = new Map(INFO_GROUPS.map((group) => [group, items.filter(item => item.group === group)]));
            const sortInfo = (a, b) => {
                if (a.name[0] === '@' && b.name[0] !== '@') {
                    return 1;
                }
                if (a.name[0] !== '@' && b.name[0] === '@') {
                    return -1;
                }
                return string_1.strcmp(a.name.toLowerCase(), b.name.toLowerCase());
            };
            const projectPath = this.project && this.project.directory;
            const splitInfo = (ary) => ary
                .sort(sortInfo)
                .map((item) => [`   ${item.name}${item.flair ? ' ' + color_1.weak('(' + item.flair + ')') : ''}`, color_1.weak(item.value) + (item.path && projectPath && !item.path.startsWith(projectPath) ? ` ${color_1.weak('(' + item.path + ')')}` : '')]);
            const format = (details) => utils_terminal_1.columnar(details, { vsep: ':' });
            if (!projectPath) {
                this.env.log.warn('You are not in an Ionic project directory. Project context may be missing.');
            }
            this.env.log.nl();
            for (const [group, info] of groupedInfo.entries()) {
                if (info.length > 0) {
                    this.env.log.rawmsg(`${color_1.strong(`${lodash.startCase(group)}:`)}\n\n`);
                    this.env.log.rawmsg(`${format(splitInfo(info))}\n\n`);
                }
            }
        }
    }
}
exports.InfoCommand = InfoCommand;
