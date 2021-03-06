"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapacitorNamespace = void 0;
const color_1 = require("../../lib/color");
const namespace_1 = require("../../lib/namespace");
class CapacitorNamespace extends namespace_1.Namespace {
    async getMetadata() {
        return {
            name: 'capacitor',
            summary: 'Capacitor functionality',
            description: `
These commands integrate with Capacitor, Ionic's new native layer project which provides an alternative to Cordova for native functionality in your app.

Learn more about Capacitor:
- Main documentation: ${color_1.strong('https://ion.link/capacitor')}
      `,
        };
    }
    async getCommands() {
        return new namespace_1.CommandMap([
            ['add', async () => { const { AddCommand } = await Promise.resolve().then(() => require('./add')); return new AddCommand(this); }],
            ['build', async () => { const { BuildCommand } = await Promise.resolve().then(() => require('./build')); return new BuildCommand(this); }],
            ['copy', async () => { const { CopyCommand } = await Promise.resolve().then(() => require('./copy')); return new CopyCommand(this); }],
            ['open', async () => { const { OpenCommand } = await Promise.resolve().then(() => require('./open')); return new OpenCommand(this); }],
            ['run', async () => { const { RunCommand } = await Promise.resolve().then(() => require('./run')); return new RunCommand(this); }],
            ['sync', async () => { const { SyncCommand } = await Promise.resolve().then(() => require('./sync')); return new SyncCommand(this); }],
            ['update', async () => { const { UpdateCommand } = await Promise.resolve().then(() => require('./update')); return new UpdateCommand(this); }],
        ]);
    }
}
exports.CapacitorNamespace = CapacitorNamespace;
