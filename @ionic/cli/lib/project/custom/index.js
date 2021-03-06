"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomProject = void 0;
const __1 = require("../");
const color_1 = require("../../color");
const errors_1 = require("../../errors");
class CustomProject extends __1.Project {
    constructor() {
        super(...arguments);
        this.type = 'custom';
    }
    /**
     * We can't detect custom project types. We don't know what they look like!
     */
    async detected() {
        return false;
    }
    async requireBuildRunner() {
        const { CustomBuildRunner } = await Promise.resolve().then(() => require('./build'));
        const deps = { ...this.e, project: this };
        return new CustomBuildRunner(deps);
    }
    async requireServeRunner() {
        const { CustomServeRunner } = await Promise.resolve().then(() => require('./serve'));
        const deps = { ...this.e, project: this };
        return new CustomServeRunner(deps);
    }
    async requireGenerateRunner() {
        throw new errors_1.RunnerNotFoundException(`Cannot perform generate for custom projects.\n` +
            `Since you're using the ${color_1.strong('custom')} project type, this command won't work. The Ionic CLI doesn't know how to generate framework components for custom projects.`);
    }
}
exports.CustomProject = CustomProject;
