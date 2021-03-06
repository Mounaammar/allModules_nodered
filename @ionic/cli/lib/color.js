"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.title = exports.ancillary = exports.failure = exports.success = exports.input = exports.weak = exports.strong = exports.COLORS = void 0;
const cli_framework_1 = require("@ionic/cli-framework");
const chalk = require("chalk");
const HELP_COLORS = {
    title: chalk.bold,
};
exports.COLORS = { ...cli_framework_1.DEFAULT_COLORS, help: { ...cli_framework_1.DEFAULT_COLORS.help, ...HELP_COLORS } };
exports.strong = exports.COLORS.strong, exports.weak = exports.COLORS.weak, exports.input = exports.COLORS.input, exports.success = exports.COLORS.success, exports.failure = exports.COLORS.failure, exports.ancillary = exports.COLORS.ancillary, exports.title = exports.COLORS.help.title;
