"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setIonicRemote = exports.addIonicRemote = exports.getIonicRemote = exports.initializeRepo = exports.isRepoInitialized = exports.getTopLevel = exports.isGitInstalled = void 0;
const utils_fs_1 = require("@ionic/utils-fs");
const path = require("path");
async function isGitInstalled({ shell }) {
    return Boolean(await shell.cmdinfo('git', ['--version']));
}
exports.isGitInstalled = isGitInstalled;
async function getTopLevel({ shell }) {
    return shell.cmdinfo('git', ['rev-parse', '--show-toplevel']);
}
exports.getTopLevel = getTopLevel;
async function isRepoInitialized(dir) {
    return utils_fs_1.pathExists(path.join(dir, '.git'));
}
exports.isRepoInitialized = isRepoInitialized;
async function initializeRepo({ shell }, dir) {
    await shell.run('git', ['init'], { cwd: dir });
}
exports.initializeRepo = initializeRepo;
async function getIonicRemote({ shell }, dir) {
    const regex = /ionic\t(.+) \(\w+\)/;
    // would like to use get-url, but not available in git 2.0.0
    const remotes = await shell.output('git', ['remote', '-v'], { cwd: dir });
    for (const line of remotes.split('\n')) {
        const match = regex.exec(line.trim());
        if (match) {
            return match[1];
        }
    }
}
exports.getIonicRemote = getIonicRemote;
async function addIonicRemote({ shell }, dir, url) {
    await shell.run('git', ['remote', 'add', 'ionic', url], { cwd: dir });
}
exports.addIonicRemote = addIonicRemote;
async function setIonicRemote({ shell }, dir, url) {
    await shell.run('git', ['remote', 'set-url', 'ionic', url], { cwd: dir });
}
exports.setIonicRemote = setIonicRemote;
