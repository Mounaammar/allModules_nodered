"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitNamespace = void 0;
const namespace_1 = require("../../lib/namespace");
class GitNamespace extends namespace_1.Namespace {
    async getMetadata() {
        return {
            name: 'git',
            summary: 'Commands relating to managing Appflow git',
            groups: ["paid" /* PAID */],
        };
    }
    async getCommands() {
        return new namespace_1.CommandMap([
            ['clone', async () => { const { GitCloneCommand } = await Promise.resolve().then(() => require('./clone')); return new GitCloneCommand(this); }],
            ['remote', async () => { const { GitRemoteCommand } = await Promise.resolve().then(() => require('./remote')); return new GitRemoteCommand(this); }],
        ]);
    }
}
exports.GitNamespace = GitNamespace;
