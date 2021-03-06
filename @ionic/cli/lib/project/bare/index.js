"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BareProject = void 0;
const __1 = require("../");
const errors_1 = require("../../errors");
class BareProject extends __1.Project {
    constructor() {
        super(...arguments);
        this.type = 'bare';
    }
    async detected() {
        return false;
    }
    async requireBuildRunner() {
        throw new errors_1.RunnerNotFoundException(`Cannot perform build for bare projects.\n` +
            `The Ionic CLI doesn't know how to build bare projects.`);
    }
    async requireServeRunner() {
        throw new errors_1.RunnerNotFoundException(`Cannot perform serve for bare projects.\n` +
            `The Ionic CLI doesn't know how to serve bare projects.`);
    }
    async requireGenerateRunner() {
        throw new errors_1.RunnerNotFoundException(`Cannot perform generate for bare projects.\n` +
            `The Ionic CLI doesn't know how to generate framework components for bare projects.`);
    }
}
exports.BareProject = BareProject;
