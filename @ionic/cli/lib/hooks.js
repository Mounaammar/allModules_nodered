"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locateHook = exports.removeHook = exports.addHook = exports.Hook = void 0;
const utils_array_1 = require("@ionic/utils-array");
const utils_terminal_1 = require("@ionic/utils-terminal");
const Debug = require("debug");
const lodash = require("lodash");
const path = require("path");
const color_1 = require("./color");
const errors_1 = require("./errors");
const debug = Debug('ionic:lib:hooks');
class Hook {
    constructor(e) {
        this.e = e;
    }
    get script() {
        return `ionic:${this.name}`;
    }
    async run(input) {
        const { pkgManagerArgs } = await Promise.resolve().then(() => require('./utils/npm'));
        const type = this.e.project.type;
        if (!type || !this.e.project.directory) {
            return; // TODO: will we need hooks outside a project?
        }
        const [pkg] = await this.e.project.getPackageJson(undefined, { logErrors: false });
        if (!pkg) {
            return;
        }
        debug(`Looking for ${color_1.ancillary(this.script)} npm script.`);
        const ctxEnvironment = this.generateCTXEnvironment(input);
        if (pkg.scripts && pkg.scripts[this.script]) {
            debug(`Invoking ${color_1.ancillary(this.script)} npm script.`);
            const [pkgManager, ...pkgArgs] = await pkgManagerArgs(this.e.config.get('npmClient'), { command: 'run', script: this.script });
            await this.e.shell.run(pkgManager, pkgArgs, {
                env: ctxEnvironment,
            });
        }
        const projectHooks = this.e.project.config.get('hooks');
        const hooks = projectHooks ? utils_array_1.conform(projectHooks[this.name]) : [];
        for (const h of hooks) {
            const p = path.resolve(this.e.project.directory, h);
            try {
                if (path.extname(p) !== '.js') {
                    throw new Error(`Hooks must be .js files with a function for its default export.`);
                }
                const hook = await this.loadHookFn(p);
                if (!hook) {
                    throw new Error(`Module must have a function for its default export.`);
                }
                await hook(lodash.assign({}, input, {
                    project: {
                        type,
                        dir: this.e.project.directory,
                        srcDir: await this.e.project.getSourceDir(),
                    },
                    argv: process.argv,
                    env: {
                        ...process.env,
                        ...ctxEnvironment,
                    },
                }));
            }
            catch (e) {
                throw new errors_1.HookException(`An error occurred while running an Ionic CLI hook defined in ${color_1.strong(utils_terminal_1.prettyPath(this.e.project.filePath))}.\n` +
                    `Hook: ${color_1.strong(this.name)}\n` +
                    `File: ${color_1.strong(p)}\n\n` +
                    `${color_1.failure(e.stack ? e.stack : e)}`);
            }
        }
    }
    async loadHookFn(p) {
        const module = require(p);
        if (typeof module === 'function') {
            return module;
        }
        else if (typeof module.default === 'function') {
            return module.default;
        }
        debug(`Could not load hook function ${color_1.strong(p)}: %o not a function`, module);
    }
    generateCTXEnvironment(input, path = []) {
        let environment = {};
        for (const [key, value] of Object.entries(input)) {
            if (typeof value === 'object') {
                environment = {
                    ...environment,
                    ...this.generateCTXEnvironment(value, [...path, key]),
                };
            }
            else {
                const name = [...path, key].join('_');
                environment[`IONIC_CLI_HOOK_CTX_${lodash.snakeCase(name)}`.toUpperCase()] = value;
            }
        }
        return environment;
    }
}
exports.Hook = Hook;
function addHook(baseDir, hooks, hook) {
    const hookPaths = utils_array_1.conform(hooks);
    const resolvedHookPaths = hookPaths.map(p => path.resolve(baseDir, p));
    if (!resolvedHookPaths.includes(path.resolve(baseDir, hook))) {
        hookPaths.push(hook);
    }
    return hookPaths;
}
exports.addHook = addHook;
function removeHook(baseDir, hooks, hook) {
    const hookPaths = utils_array_1.conform(hooks);
    const i = locateHook(baseDir, hookPaths, hook);
    if (i >= 0) {
        hookPaths.splice(i, 1);
    }
    return hookPaths;
}
exports.removeHook = removeHook;
function locateHook(baseDir, hooks, hook) {
    return utils_array_1.conform(hooks).map(p => path.resolve(baseDir, p)).indexOf(path.resolve(baseDir, hook));
}
exports.locateHook = locateHook;
