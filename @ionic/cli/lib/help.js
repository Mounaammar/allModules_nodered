"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandSchemaHelpFormatter = exports.NamespaceSchemaHelpFormatter = exports.CommandStringHelpFormatter = exports.NamespaceStringHelpFormatter = void 0;
const cli_framework_1 = require("@ionic/cli-framework");
const utils_array_1 = require("@ionic/utils-array");
const color_1 = require("./color");
const config_1 = require("./config");
const IONIC_LOGO = String.raw `
   _             _
  (_) ___  _ __ (_) ___
  | |/ _ \| '_ \| |/ __|
  | | (_) | | | | | (__
  |_|\___/|_| |_|_|\___|`;
class NamespaceStringHelpFormatter extends cli_framework_1.NamespaceStringHelpFormatter {
    constructor({ version, inProject, ...rest }) {
        super({ ...rest, colors: color_1.COLORS });
        this.inProject = inProject;
        this.version = version;
    }
    async formatHeader() {
        return this.namespace.parent ? super.formatHeader() : this.formatIonicHeader();
    }
    async formatIonicHeader() {
        const { strong } = this.colors;
        return `\n${IONIC_LOGO} ${strong(`CLI ${this.version}`)}\n\n`;
    }
    async getGlobalOptions() {
        const visibleOptions = await utils_array_1.filter(config_1.GLOBAL_OPTIONS, async (opt) => cli_framework_1.isOptionVisible(opt));
        return visibleOptions.map(opt => cli_framework_1.formatOptionName(opt, { colors: cli_framework_1.NO_COLORS, showAliases: false }));
    }
    async formatCommands() {
        const { strong } = this.colors;
        const commands = await this.getCommandMetadataList();
        const globalCmds = commands.filter(cmd => cmd.type === 'global');
        const projectCmds = commands.filter(cmd => cmd.type === 'project');
        return ((await this.formatCommandGroup('Global Commands', globalCmds)) +
            (this.inProject ? await this.formatCommandGroup('Project Commands', projectCmds) : `\n  ${strong('Project Commands')}:\n\n    You are not in a project directory.\n`));
    }
}
exports.NamespaceStringHelpFormatter = NamespaceStringHelpFormatter;
class CommandStringHelpFormatter extends cli_framework_1.CommandStringHelpFormatter {
    constructor(options) {
        super({ ...options, colors: color_1.COLORS });
    }
    async formatOptions() {
        const metadata = await this.getCommandMetadata();
        const options = metadata.options ? metadata.options : [];
        const basicOptions = options.filter(o => !o.groups || !o.groups.includes("advanced" /* ADVANCED */));
        const advancedOptions = options.filter(o => o.groups && o.groups.includes("advanced" /* ADVANCED */));
        return ((await this.formatOptionsGroup('Options', basicOptions)) +
            (await this.formatOptionsGroup('Advanced Options', advancedOptions)));
    }
    async formatBeforeOptionSummary(opt) {
        return (opt.hint ? `${opt.hint} ` : '') + await super.formatBeforeOptionSummary(opt);
    }
}
exports.CommandStringHelpFormatter = CommandStringHelpFormatter;
class NamespaceSchemaHelpFormatter extends cli_framework_1.NamespaceSchemaHelpFormatter {
    async formatCommand(cmd) {
        const { command } = cmd;
        const formatter = new CommandSchemaHelpFormatter({
            location: { path: [...cmd.path], obj: command, args: [] },
            command,
            metadata: cmd,
        });
        return { ...await formatter.serialize(), type: cmd.type };
    }
}
exports.NamespaceSchemaHelpFormatter = NamespaceSchemaHelpFormatter;
class CommandSchemaHelpFormatter extends cli_framework_1.CommandSchemaHelpFormatter {
    async formatCommand(cmd) {
        const formatted = await super.formatCommand(cmd);
        return { ...formatted, type: cmd.type };
    }
}
exports.CommandSchemaHelpFormatter = CommandSchemaHelpFormatter;
