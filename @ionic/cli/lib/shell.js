"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prependNodeModulesBinToPath = exports.Shell = void 0;
const cli_framework_output_1 = require("@ionic/cli-framework-output");
const utils_process_1 = require("@ionic/utils-process");
const utils_subprocess_1 = require("@ionic/utils-subprocess");
const utils_terminal_1 = require("@ionic/utils-terminal");
const chalk = require("chalk");
const Debug = require("debug");
const path = require("path");
const split2 = require("split2");
const combineStreams = require("stream-combiner2");
const guards_1 = require("../guards");
const color_1 = require("./color");
const errors_1 = require("./errors");
const debug = Debug('ionic:lib:shell');
class Shell {
    constructor(e, options) {
        this.e = e;
        this.alterPath = options && options.alterPath ? options.alterPath : (p) => p;
    }
    async run(command, args, { stream, killOnExit = true, showCommand = true, showError = true, fatalOnNotFound = true, fatalOnError = true, truncateErrorOutput, ...crossSpawnOptions }) {
        const proc = await this.createSubprocess(command, args, crossSpawnOptions);
        const fullCmd = proc.bashify();
        const truncatedCmd = fullCmd.length > 80 ? fullCmd.substring(0, 80) + '...' : fullCmd;
        if (showCommand && this.e.log.level >= cli_framework_output_1.LOGGER_LEVELS.INFO) {
            this.e.log.rawmsg(`> ${color_1.input(fullCmd)}`);
        }
        const ws = stream ? stream : this.e.log.createWriteStream(cli_framework_output_1.LOGGER_LEVELS.INFO, false);
        try {
            const promise = proc.run();
            if (promise.p.stdout) {
                const s = combineStreams(split2(), ws);
                // TODO: https://github.com/angular/angular-cli/issues/10922
                s.on('error', (err) => {
                    debug('Error in subprocess stdout pipe: %o', err);
                });
                promise.p.stdout.pipe(s);
            }
            if (promise.p.stderr) {
                const s = combineStreams(split2(), ws);
                // TODO: https://github.com/angular/angular-cli/issues/10922
                s.on('error', (err) => {
                    debug('Error in subprocess stderr pipe: %o', err);
                });
                promise.p.stderr.pipe(s);
            }
            if (killOnExit) {
                utils_process_1.onBeforeExit(async () => {
                    if (promise.p.pid) {
                        await utils_process_1.killProcessTree(promise.p.pid);
                    }
                });
            }
            await promise;
        }
        catch (e) {
            if (e instanceof utils_subprocess_1.SubprocessError && e.code === utils_subprocess_1.ERROR_COMMAND_NOT_FOUND) {
                if (fatalOnNotFound) {
                    throw new errors_1.FatalException(`Command not found: ${color_1.input(command)}`, 127);
                }
                else {
                    throw e;
                }
            }
            if (!guards_1.isExitCodeException(e)) {
                throw e;
            }
            let err = e.message || '';
            if (truncateErrorOutput && err.length > truncateErrorOutput) {
                err = `${color_1.strong('(truncated)')} ... ` + err.substring(err.length - truncateErrorOutput);
            }
            const publicErrorMsg = (`An error occurred while running subprocess ${color_1.input(command)}.\n` +
                `${color_1.input(truncatedCmd)} exited with exit code ${e.exitCode}.\n\n` +
                `Re-running this command with the ${color_1.input('--verbose')} flag may provide more information.`);
            const privateErrorMsg = `Subprocess (${color_1.input(command)}) encountered an error (exit code ${e.exitCode}).`;
            if (fatalOnError) {
                if (showError) {
                    throw new errors_1.FatalException(publicErrorMsg, e.exitCode);
                }
                else {
                    throw new errors_1.FatalException(privateErrorMsg, e.exitCode);
                }
            }
            else {
                if (showError) {
                    this.e.log.error(publicErrorMsg);
                }
            }
            throw e;
        }
    }
    async output(command, args, { fatalOnNotFound = true, fatalOnError = true, showError = true, showCommand = false, ...crossSpawnOptions }) {
        const proc = await this.createSubprocess(command, args, crossSpawnOptions);
        const fullCmd = proc.bashify();
        const truncatedCmd = fullCmd.length > 80 ? fullCmd.substring(0, 80) + '...' : fullCmd;
        if (showCommand && this.e.log.level >= cli_framework_output_1.LOGGER_LEVELS.INFO) {
            this.e.log.rawmsg(`> ${color_1.input(fullCmd)}`);
        }
        try {
            return await proc.output();
        }
        catch (e) {
            if (e instanceof utils_subprocess_1.SubprocessError && e.code === utils_subprocess_1.ERROR_COMMAND_NOT_FOUND) {
                if (fatalOnNotFound) {
                    throw new errors_1.FatalException(`Command not found: ${color_1.input(command)}`, 127);
                }
                else {
                    throw e;
                }
            }
            if (!guards_1.isExitCodeException(e)) {
                throw e;
            }
            const errorMsg = `An error occurred while running ${color_1.input(truncatedCmd)} (exit code ${e.exitCode})\n`;
            if (fatalOnError) {
                throw new errors_1.FatalException(errorMsg, e.exitCode);
            }
            else {
                if (showError) {
                    this.e.log.error(errorMsg);
                }
            }
            return '';
        }
    }
    /**
     * When `child_process.spawn` isn't provided a full path to the command
     * binary, it behaves differently on Windows than other platforms. For
     * Windows, discover the full path to the binary, otherwise fallback to the
     * command provided.
     *
     * @see https://github.com/ionic-team/ionic-cli/issues/3563#issuecomment-425232005
     */
    async resolveCommandPath(command, options) {
        if (utils_terminal_1.TERMINAL_INFO.windows) {
            try {
                return await this.which(command, { PATH: options.env && options.env.PATH ? options.env.PATH : process.env.PATH });
            }
            catch (e) {
                // ignore
            }
        }
        return command;
    }
    async which(command, { PATH = process.env.PATH } = {}) {
        return utils_subprocess_1.which(command, { PATH: this.alterPath(PATH || '') });
    }
    async spawn(command, args, { showCommand = true, ...crossSpawnOptions }) {
        const proc = await this.createSubprocess(command, args, crossSpawnOptions);
        const p = proc.spawn();
        if (showCommand && this.e.log.level >= cli_framework_output_1.LOGGER_LEVELS.INFO) {
            this.e.log.rawmsg(`> ${color_1.input(proc.bashify())}`);
        }
        return p;
    }
    async cmdinfo(command, args = []) {
        const opts = {};
        const proc = await this.createSubprocess(command, args, opts);
        try {
            const out = await proc.output();
            return out.split('\n').join(' ').trim();
        }
        catch (e) {
            // no command info at this point
        }
    }
    async createSubprocess(command, args = [], options = {}) {
        this.prepareSpawnOptions(options);
        const cmdpath = await this.resolveCommandPath(command, options);
        const proc = new utils_subprocess_1.Subprocess(cmdpath, args, options);
        return proc;
    }
    prepareSpawnOptions(options) {
        var _a;
        // Create a `process.env`-type object from all key/values of `process.env`,
        // then `options.env`, then add several key/values. PATH is supplemented
        // with the `node_modules\.bin` folder in the project directory so that we
        // can run binaries inside a project.
        options.env = utils_process_1.createProcessEnv(process.env, (_a = options.env) !== null && _a !== void 0 ? _a : {}, {
            PATH: this.alterPath(process.env.PATH || ''),
            FORCE_COLOR: chalk.level > 0 ? '1' : '0',
        });
    }
}
exports.Shell = Shell;
function prependNodeModulesBinToPath(projectDir, p) {
    return path.resolve(projectDir, 'node_modules', '.bin') + path.delimiter + p;
}
exports.prependNodeModulesBinToPath = prependNodeModulesBinToPath;
