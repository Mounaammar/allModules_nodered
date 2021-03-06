"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFullCommandParts = exports.metadataToCmdOptsEnv = exports.runCommand = exports.Executor = exports.HELP_FLAGS = exports.VERSION_FLAGS = void 0;
const cli_framework_1 = require("@ionic/cli-framework");
const lodash = require("lodash");
const guards_1 = require("../guards");
const color_1 = require("./color");
const config_1 = require("./config");
const errors_1 = require("./errors");
exports.VERSION_FLAGS = ['--version', '-v'];
exports.HELP_FLAGS = ['--help', '-?', '-h'];
class Executor extends cli_framework_1.BaseExecutor {
    async locate(argv) {
        const pargs = cli_framework_1.stripOptions(argv, {});
        const location = await this.namespace.locate(pargs);
        const args = lodash.drop(argv, location.path.length - 1);
        if (lodash.intersection(exports.VERSION_FLAGS, argv).length > 0) {
            return this.locate(['version', ...pargs]);
        }
        else if (lodash.intersection(exports.HELP_FLAGS, argv).length > 0 || !guards_1.isCommand(location.obj)) {
            return this.locate(['help', ...pargs]);
        }
        return { ...location, args };
    }
    async run(command, cmdargs, { location, env, executor }) {
        const metadata = await command.getMetadata();
        const parts = getFullCommandParts(location);
        if (metadata.options) {
            const optMap = metadataToCmdOptsEnv(metadata, parts.slice(1));
            // TODO: changes opt by reference, which is probably bad
            for (const [opt, envvar] of optMap.entries()) {
                const envdefault = env[envvar];
                if (typeof envdefault !== 'undefined') {
                    opt.default = opt.type === Boolean ? (envdefault && envdefault !== '0' ? true : false) : envdefault;
                }
            }
        }
        const metadataOpts = [...metadata.options ? metadata.options : [], ...config_1.GLOBAL_OPTIONS];
        const minimistOpts = cli_framework_1.metadataOptionsToParseArgsOptions(metadataOpts);
        const cmdoptions = cli_framework_1.parseArgs(cmdargs, minimistOpts);
        const cmdinputs = cmdoptions._;
        const { project } = this.namespace;
        if (project) {
            if (project.details.context === 'multiapp') {
                cmdoptions['project'] = project.details.id;
            }
        }
        else {
            if (metadata.type === 'project') {
                throw new errors_1.FatalException(`Sorry! ${color_1.input(parts.join(' '))} can only be run in an Ionic project directory.\n` +
                    `If this is a project you'd like to integrate with Ionic, run ${color_1.input('ionic init')}.`);
            }
        }
        await command.execute(cmdinputs, cmdoptions, { location, env, executor });
    }
}
exports.Executor = Executor;
async function runCommand(runinfo, argv) {
    const { env, executor } = runinfo;
    const metadata = await executor.namespace.getMetadata();
    executor.namespace.env.log.msg(`> ${color_1.input([metadata.name, ...argv].map(a => a.includes(' ') ? `"${a}"` : a).join(' '))}`);
    await executor.execute(argv, env);
}
exports.runCommand = runCommand;
function metadataToCmdOptsEnv(metadata, cmdNameParts) {
    const optMap = new Map();
    if (!metadata.options) {
        return optMap;
    }
    const prefix = `IONIC_CMDOPTS_${cmdNameParts.map(s => s.toUpperCase()).join('_')}`;
    for (const option of metadata.options) {
        optMap.set(option, `${prefix}_${option.name.toUpperCase().split('-').join('_')}`);
    }
    return optMap;
}
exports.metadataToCmdOptsEnv = metadataToCmdOptsEnv;
function getFullCommandParts(location) {
    return location.path.map(([p]) => p);
}
exports.getFullCommandParts = getFullCommandParts;
