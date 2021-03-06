"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigGetCommand = void 0;
const string_1 = require("@ionic/cli-framework/utils/string");
const utils_terminal_1 = require("@ionic/utils-terminal");
const chalk = require("chalk");
const lodash = require("lodash");
const util = require("util");
const constants_1 = require("../../constants");
const color_1 = require("../../lib/color");
const base_1 = require("./base");
class ConfigGetCommand extends base_1.BaseConfigCommand {
    async getMetadata() {
        const projectFile = this.project ? utils_terminal_1.prettyPath(this.project.filePath) : constants_1.PROJECT_FILE;
        return {
            name: 'get',
            type: 'global',
            summary: 'Print config values',
            description: `
This command reads and prints configuration values from the project's ${color_1.strong(projectFile)} file. It can also operate on the global CLI configuration (${color_1.strong('~/.ionic/config.json')}) using the ${color_1.input('--global')} option.

For nested properties, separate nest levels with dots. For example, the property name ${color_1.input('integrations.cordova')} will look in the ${color_1.strong('integrations')} object for the ${color_1.strong('cordova')} property.

Without a ${color_1.input('property')} argument, this command prints out the entire config.

For multi-app projects, this command is scoped to the current project by default. To operate at the root of the project configuration file instead, use the ${color_1.input('--root')} option.

If you are using this command programmatically, you can use the ${color_1.input('--json')} option.

This command will sanitize config output for known sensitive fields (disabled when using ${color_1.input('--json')}).
      `,
            inputs: [
                {
                    name: 'property',
                    summary: 'The property name you wish to get',
                },
            ],
            options: [
                {
                    name: 'global',
                    summary: 'Use global CLI config',
                    type: Boolean,
                    aliases: ['g'],
                },
                {
                    name: 'json',
                    summary: 'Output config values in JSON',
                    type: Boolean,
                    groups: ["advanced" /* ADVANCED */],
                },
                {
                    name: 'root',
                    summary: `Operate on root of ${color_1.strong(projectFile)}`,
                    type: Boolean,
                    hint: color_1.weak('[multi-app]'),
                    groups: ["advanced" /* ADVANCED */],
                },
            ],
            exampleCommands: ['', 'id', '--global user.email', '-g npmClient'],
        };
    }
    async run(inputs, options) {
        const ctx = this.generateContext(inputs, options);
        const conf = base_1.getConfigValue(ctx);
        this.printConfig(ctx, conf);
    }
    printConfig(ctx, v) {
        const { global, json } = ctx;
        if (json) {
            process.stdout.write(this.jsonStringify(v));
        }
        else {
            if (global && v && typeof v === 'object') {
                const columns = lodash.entries(v)
                    .map(([key, value]) => [key, this.sanitizeEntry(key, value)])
                    .map(([key, value]) => [color_1.strong(key), util.inspect(value, { colors: chalk.level > 0 })]);
                columns.sort((a, b) => string_1.strcmp(a[0], b[0]));
                this.env.log.rawmsg(utils_terminal_1.columnar(columns, constants_1.COLUMNAR_OPTIONS));
            }
            else {
                this.env.log.rawmsg(util.inspect(v, { depth: Infinity, colors: chalk.level > 0 }));
            }
        }
    }
    sanitizeEntry(key, value) {
        if (key.includes('tokens')) {
            return '*****';
        }
        return value;
    }
}
exports.ConfigGetCommand = ConfigGetCommand;
