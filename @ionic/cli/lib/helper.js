"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = void 0;
const utils_fs_1 = require("@ionic/utils-fs");
const utils_subprocess_1 = require("@ionic/utils-subprocess");
const path = require("path");
async function sendMessage({ config, ctx }, msg) {
    const dir = path.dirname(config.p);
    await utils_fs_1.mkdirp(dir);
    const fd = await utils_fs_1.open(path.resolve(dir, 'helper.log'), 'a');
    const p = utils_subprocess_1.fork(ctx.binPath, ['_', '--no-interactive'], { stdio: ['ignore', fd, fd, 'ipc'] });
    p.send(msg);
    p.disconnect();
    p.unref();
}
exports.sendMessage = sendMessage;
