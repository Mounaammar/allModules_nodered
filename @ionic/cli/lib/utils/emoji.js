"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emoji = void 0;
const utils_terminal_1 = require("@ionic/utils-terminal");
function emoji(x, fallback) {
    if (utils_terminal_1.TERMINAL_INFO.windows) {
        return fallback;
    }
    return x;
}
exports.emoji = emoji;
