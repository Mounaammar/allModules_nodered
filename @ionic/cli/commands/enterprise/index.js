"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseNamespace = void 0;
const namespace_1 = require("../../lib/namespace");
class EnterpriseNamespace extends namespace_1.Namespace {
    async getMetadata() {
        return {
            name: 'enterprise',
            summary: 'Manage Ionic Enterprise features',
            description: `
Commands to help manage Ionic Enterprise[^enterprise-edition] subscriptions.
      `,
            footnotes: [
                {
                    id: 'enterprise-edition',
                    url: 'https://ionicframework.com/enterprise-edition',
                    shortUrl: 'https://ion.link/enterprise',
                },
            ],
            groups: ["paid" /* PAID */],
        };
    }
    async getCommands() {
        return new namespace_1.CommandMap([
            ['register', async () => { const { RegisterCommand } = await Promise.resolve().then(() => require('./register')); return new RegisterCommand(this); }],
        ]);
    }
}
exports.EnterpriseNamespace = EnterpriseNamespace;
