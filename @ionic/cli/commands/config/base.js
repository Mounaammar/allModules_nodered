"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsetConfigValue = exports.setConfigValue = exports.getConfigValue = exports.getConfig = exports.BaseConfigCommand = void 0;
const cli_framework_1 = require("@ionic/cli-framework");
const lodash = require("lodash");
const util = require("util");
const color_1 = require("../../lib/color");
const command_1 = require("../../lib/command");
const errors_1 = require("../../lib/errors");
class BaseConfigCommand extends command_1.Command {
    generateContext(inputs, options) {
        const [property, v] = inputs;
        const global = options['global'] ? true : false;
        const json = options['json'] ? true : false;
        const force = options['force'] ? true : false;
        const root = options['root'] ? true : false;
        const value = this.interpretValue(v, json);
        const base = { json, property, value, force, root };
        if (global) {
            if (root) {
                this.env.log.warn(`${color_1.input('--root')} has no effect with ${color_1.input('--global')}: this command always operates at root for CLI config.`);
            }
            return { global, config: this.env.config, ...base };
        }
        else {
            if (!this.project) {
                throw new errors_1.FatalException(`Sorry--this won't work outside an Ionic project directory.\n` +
                    `Did you mean to operate on global config using ${color_1.input('--global')}?`);
            }
            return { global, config: this.project.config, ...base };
        }
    }
    jsonStringify(v) {
        try {
            const serialized = JSON.stringify(v);
            if (typeof serialized === 'undefined') {
                throw new errors_1.FatalException(`Cannot serialize value: ${color_1.strong(v)}`);
            }
            return serialized;
        }
        catch (e) {
            throw new errors_1.FatalException(`Cannot serialize value: ${color_1.strong(v)}`);
        }
    }
    interpretValue(v, expectJson = false) {
        if (typeof v === 'undefined') {
            return;
        }
        try {
            // '12345e6' (a possible App ID) is interpreted as a number in scientific
            // notation during JSON.parse, so don't try
            if (!v.match(/^\d+e\d+$/)) {
                v = JSON.parse(v);
            }
        }
        catch (e) {
            if (e.name !== 'SyntaxError') {
                throw e;
            }
            if (expectJson) {
                throw new errors_1.FatalException(`${color_1.input('--json')}: ${color_1.input(String(v))} is invalid JSON: ${color_1.failure(e.toString())}`);
            }
        }
        return v;
    }
}
exports.BaseConfigCommand = BaseConfigCommand;
class FlexibleConfig extends cli_framework_1.BaseConfig {
    provideDefaults() {
        return {};
    }
}
function getConfig(ctx) {
    return ctx.root ? new FlexibleConfig(ctx.config.p) : ctx.config;
}
exports.getConfig = getConfig;
function getConfigValue(ctx) {
    const { c } = getConfig(ctx);
    if (ctx.global) { // Global config is flattened
        return ctx.property ? c[ctx.property] : c;
    }
    else {
        return ctx.property ? lodash.get(c, ctx.property) : c;
    }
}
exports.getConfigValue = getConfigValue;
function setConfigValue(ctx) {
    const conf = getConfig(ctx);
    if (ctx.originalValue && typeof ctx.originalValue === 'object' && !ctx.force) {
        throw new errors_1.FatalException(`Sorry--will not override objects or arrays without ${color_1.input('--force')}.\n` +
            `Value of ${color_1.input(ctx.property)} is: ${color_1.strong(util.inspect(ctx.originalValue, { colors: false }))}`);
    }
    if (ctx.global) { // Global config is flattened
        conf.set(ctx.property, ctx.value);
    }
    else {
        const { c } = conf;
        lodash.set(c, ctx.property, ctx.value);
        conf.c = c;
    }
}
exports.setConfigValue = setConfigValue;
function unsetConfigValue(ctx) {
    const conf = getConfig(ctx);
    if (ctx.global) { // Global config is flattened
        conf.unset(ctx.property);
    }
    else {
        const { c } = conf;
        lodash.unset(c, ctx.property);
        conf.c = c;
    }
}
exports.unsetConfigValue = unsetConfigValue;
