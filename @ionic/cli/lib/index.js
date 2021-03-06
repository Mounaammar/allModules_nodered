"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateIonicEnvironment = void 0;
const cli_framework_output_1 = require("@ionic/cli-framework-output");
const cli_framework_prompts_1 = require("@ionic/cli-framework-prompts");
const utils_terminal_1 = require("@ionic/utils-terminal");
const Debug = require("debug");
const path = require("path");
const bootstrap_1 = require("../bootstrap");
const color_1 = require("./color");
const config_1 = require("./config");
const environment_1 = require("./environment");
const http_1 = require("./http");
const project_1 = require("./project");
const prompts_1 = require("./prompts");
const session_1 = require("./session");
const shell_1 = require("./shell");
const http_2 = require("./utils/http");
const logger_1 = require("./utils/logger");
const debug = Debug('ionic:lib');
async function generateIonicEnvironment(ctx, pargv) {
    process.chdir(ctx.execPath);
    const argv = config_1.parseGlobalOptions(pargv);
    const config = new config_1.Config(path.resolve(process.env['IONIC_CONFIG_DIRECTORY'] || config_1.DEFAULT_CONFIG_DIRECTORY, config_1.CONFIG_FILE));
    debug('Terminal info: %o', utils_terminal_1.TERMINAL_INFO);
    if (config.get('interactive') === false || !utils_terminal_1.TERMINAL_INFO.tty || utils_terminal_1.TERMINAL_INFO.ci) {
        argv['interactive'] = false;
    }
    const flags = argv; // TODO
    debug('CLI global options: %o', flags);
    const log = new logger_1.Logger({
        level: argv['quiet'] ? cli_framework_output_1.LOGGER_LEVELS.WARN : cli_framework_output_1.LOGGER_LEVELS.INFO,
        handlers: logger_1.createDefaultLoggerHandlers(),
    });
    const prompt = await cli_framework_prompts_1.createPromptModule({
        interactive: argv['interactive'],
        onFallback: prompts_1.createOnFallback({ flags, log }),
    });
    const projectDir = await project_1.findProjectDirectory(ctx.execPath);
    const proxyVars = http_2.PROXY_ENVIRONMENT_VARIABLES.map((e) => [e, process.env[e]]).filter(([, v]) => !!v);
    const getInfo = async () => {
        const osName = await Promise.resolve().then(() => require('os-name'));
        const semver = await Promise.resolve().then(() => require('semver'));
        const { getUpdateConfig } = await Promise.resolve().then(() => require('./updates'));
        const os = osName();
        const [npm, nativeRun, cordovaRes] = await Promise.all([
            shell.cmdinfo('npm', ['-v']),
            shell.cmdinfo('native-run', ['--version']),
            shell.cmdinfo('cordova-res', ['--version']),
        ]);
        const { packages: latestVersions } = await getUpdateConfig({ config });
        const latestNativeRun = latestVersions.find(pkg => pkg.name === 'native-run');
        const latestCordovaRes = latestVersions.find(pkg => pkg.name === 'cordova-res');
        const nativeRunUpdate = latestNativeRun && nativeRun ? semver.gt(latestNativeRun.version, nativeRun) : false;
        const cordovaResUpdate = latestCordovaRes && cordovaRes ? semver.gt(latestCordovaRes.version, cordovaRes) : false;
        const info = [
            {
                group: 'ionic',
                name: 'Ionic CLI',
                key: 'version',
                value: ctx.version,
                path: ctx.libPath,
            },
            { group: 'system', name: 'NodeJS', key: 'node_version', value: process.version, path: process.execPath },
            { group: 'system', name: 'npm', key: 'npm_version', value: npm || 'not installed' },
            { group: 'system', name: 'OS', key: 'os', value: os },
            {
                group: 'utility',
                name: 'native-run',
                key: 'native_run_version',
                value: nativeRun || 'not installed globally',
                flair: nativeRunUpdate ? `update available: ${latestNativeRun ? color_1.success(latestNativeRun.version) : '???'}` : '',
            },
            {
                group: 'utility',
                name: 'cordova-res',
                key: 'cordova_res_version',
                value: cordovaRes || 'not installed globally',
                flair: cordovaResUpdate ? `update available: ${latestCordovaRes ? color_1.success(latestCordovaRes.version) : '???'}` : '',
            },
        ];
        info.push(...proxyVars.map(([e, v]) => ({ group: 'environment', name: e, value: v || 'not set' })));
        if (project) {
            info.push(...(await project.getInfo()));
        }
        return info;
    };
    const shell = new shell_1.Shell({ log }, { alterPath: p => projectDir ? shell_1.prependNodeModulesBinToPath(projectDir, p) : p });
    const client = new http_1.Client(config);
    const session = new session_1.ProSession({ config, client });
    const deps = { client, config, ctx, flags, log, prompt, session, shell };
    const env = new environment_1.Environment({ getInfo, ...deps });
    if (process.env['IONIC_CLI_LOCAL_ERROR']) {
        if (process.env['IONIC_CLI_LOCAL_ERROR'] === bootstrap_1.ERROR_VERSION_TOO_OLD) {
            log.warn(`Detected locally installed Ionic CLI, but it's too old--using global CLI.`);
        }
    }
    if (typeof argv['yarn'] === 'boolean') {
        log.warn(`${color_1.input('--yarn')} / ${color_1.input('--no-yarn')} has been removed. Use ${color_1.input(`ionic config set -g npmClient ${argv['yarn'] ? 'yarn' : 'npm'}`)}.`);
    }
    const project = projectDir ? await project_1.createProjectFromDirectory(projectDir, argv, deps, { logErrors: !['start', 'init'].includes(argv._[0]) }) : undefined;
    if (project) {
        shell.alterPath = p => shell_1.prependNodeModulesBinToPath(project.directory, p);
        if (project.config.get('pro_id') && argv._[1] !== 'unset') {
            log.warn(`The ${color_1.input('pro_id')} field in ${color_1.strong(utils_terminal_1.prettyPath(project.filePath))} has been deprecated.\n` +
                `Ionic Pro has been renamed to Ionic Appflow! We've copied the value in ${color_1.input('pro_id')} to ${color_1.input('id')}, but you may want to unset the deprecated property: ${color_1.input('ionic config unset pro_id')}\n`);
        }
    }
    return { env, project };
}
exports.generateIonicEnvironment = generateIonicEnvironment;
