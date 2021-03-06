"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CordovaNamespace = void 0;
const color_1 = require("../../lib/color");
const namespace_1 = require("../../lib/namespace");
class CordovaNamespace extends namespace_1.Namespace {
    async getMetadata() {
        return {
            name: 'cordova',
            summary: 'Cordova functionality',
            description: `
These commands integrate with Apache Cordova, which brings native functionality to your app.

Cordova Reference documentation:
- Overview: ${color_1.strong('https://cordova.apache.org/docs/en/latest/guide/overview/index.html')}
- CLI documentation: ${color_1.strong('https://cordova.apache.org/docs/en/latest/reference/cordova-cli/')}
      `,
        };
    }
    async getCommands() {
        return new namespace_1.CommandMap([
            ['build', async () => { const { BuildCommand } = await Promise.resolve().then(() => require('./build')); return new BuildCommand(this); }],
            ['compile', async () => { const { CompileCommand } = await Promise.resolve().then(() => require('./compile')); return new CompileCommand(this); }],
            ['emulate', async () => { const { EmulateCommand } = await Promise.resolve().then(() => require('./emulate')); return new EmulateCommand(this); }],
            ['platform', async () => { const { PlatformCommand } = await Promise.resolve().then(() => require('./platform')); return new PlatformCommand(this); }],
            ['plugin', async () => { const { PluginCommand } = await Promise.resolve().then(() => require('./plugin')); return new PluginCommand(this); }],
            ['prepare', async () => { const { PrepareCommand } = await Promise.resolve().then(() => require('./prepare')); return new PrepareCommand(this); }],
            ['resources', async () => { const { ResourcesCommand } = await Promise.resolve().then(() => require('./resources')); return new ResourcesCommand(this); }],
            ['run', async () => { const { RunCommand } = await Promise.resolve().then(() => require('./run')); return new RunCommand(this); }],
            ['requirements', async () => { const { RequirementsCommand } = await Promise.resolve().then(() => require('./requirements')); return new RequirementsCommand(this); }],
            ['platforms', 'platform'],
            ['plugins', 'plugin'],
            ['res', 'resources'],
        ]);
    }
}
exports.CordovaNamespace = CordovaNamespace;
