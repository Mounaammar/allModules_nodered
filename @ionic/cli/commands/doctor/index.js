"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorNamespace = void 0;
const namespace_1 = require("../../lib/namespace");
class DoctorNamespace extends namespace_1.Namespace {
    async getMetadata() {
        return {
            name: 'doctor',
            summary: 'Commands for checking the health of your Ionic project',
        };
    }
    async getCommands() {
        return new namespace_1.CommandMap([
            ['check', async () => { const { DoctorCheckCommand } = await Promise.resolve().then(() => require('./check')); return new DoctorCheckCommand(this); }],
            ['treat', async () => { const { DoctorTreatCommand } = await Promise.resolve().then(() => require('./treat')); return new DoctorTreatCommand(this); }],
            ['list', async () => { const { DoctorListCommand } = await Promise.resolve().then(() => require('./list')); return new DoctorListCommand(this); }],
            ['ls', 'list'],
            ['checkup', 'check'],
            ['validate', 'check'],
            ['fix', 'treat'],
        ]);
    }
}
exports.DoctorNamespace = DoctorNamespace;
