"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmulateCommand = void 0;
const run_1 = require("./run");
class EmulateCommand extends run_1.RunCommand {
    async getMetadata() {
        const metadata = await super.getMetadata();
        return {
            ...metadata,
            name: 'emulate',
            summary: 'Emulate an Ionic project on a simulator/emulator',
        };
    }
}
exports.EmulateCommand = EmulateCommand;
