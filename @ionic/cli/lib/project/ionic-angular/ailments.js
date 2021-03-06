"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IonicAngularPackageJsonHasDefaultIonicServeCommand = exports.IonicAngularPackageJsonHasDefaultIonicBuildCommand = exports.AppScriptsMajorUpdateAvailable = exports.AppScriptsUpdateAvailable = exports.IonicAngularMajorUpdateAvailable = exports.IonicAngularUpdateAvailable = exports.IonicAngularAilment = void 0;
const semver = require("semver");
const build_1 = require("../../build");
const color_1 = require("../../color");
const doctor_1 = require("../../doctor");
const serve_1 = require("../../serve");
const npm_1 = require("../../utils/npm");
const build_2 = require("./build");
const serve_2 = require("./serve");
class IonicAngularAilment extends doctor_1.Ailment {
    constructor(deps) {
        super(deps);
        this.projects = ['ionic-angular'];
        this.project = deps.project;
    }
}
exports.IonicAngularAilment = IonicAngularAilment;
class IonicAngularUpdateAvailable extends IonicAngularAilment {
    constructor() {
        super(...arguments);
        this.id = 'ionic-angular-update-available';
    }
    async getVersionPair() {
        if (!this.currentVersion || !this.latestVersion) {
            const [currentPkg] = await this.project.getPackageJson('ionic-angular');
            const latestPkg = await npm_1.pkgFromRegistry(this.config.get('npmClient'), { pkg: 'ionic-angular' });
            this.currentVersion = currentPkg ? currentPkg.version : undefined;
            this.latestVersion = latestPkg ? latestPkg.version : undefined;
        }
        if (!this.currentVersion || !this.latestVersion) {
            return ['0.0.0', '0.0.0'];
        }
        return [this.currentVersion, this.latestVersion];
    }
    async getMessage() {
        const [currentVersion, latestVersion] = await this.getVersionPair();
        return (`Update available for Ionic Framework.\n` +
            `An update is available for ${color_1.strong('ionic-angular')} (${color_1.ancillary(currentVersion)} => ${color_1.ancillary(latestVersion)}).\n`).trim();
    }
    async detected() {
        const [currentVersion, latestVersion] = await this.getVersionPair();
        const diff = semver.diff(currentVersion, latestVersion);
        return diff === 'minor' || diff === 'patch';
    }
    async getTreatmentSteps() {
        const [, latestVersion] = await this.getVersionPair();
        const args = await npm_1.pkgManagerArgs(this.config.get('npmClient'), { command: 'install', pkg: `ionic-angular@${latestVersion ? latestVersion : 'latest'}` });
        return [
            { message: `Visit ${color_1.strong('https://github.com/ionic-team/ionic/releases')} for each upgrade's instructions` },
            { message: `If no instructions, run: ${color_1.input(args.join(' '))}` },
            { message: `Watch for npm warnings about peer dependencies--they may need manual updating` },
        ];
    }
}
exports.IonicAngularUpdateAvailable = IonicAngularUpdateAvailable;
class IonicAngularMajorUpdateAvailable extends IonicAngularAilment {
    constructor() {
        super(...arguments);
        this.id = 'ionic-angular-major-update-available';
    }
    async getVersionPair() {
        if (!this.currentVersion || !this.latestVersion) {
            const [currentPkg] = await this.project.getPackageJson('ionic-angular');
            const latestPkg = await npm_1.pkgFromRegistry(this.config.get('npmClient'), { pkg: 'ionic-angular' });
            this.currentVersion = currentPkg ? currentPkg.version : undefined;
            this.latestVersion = latestPkg ? latestPkg.version : undefined;
        }
        if (!this.currentVersion || !this.latestVersion) {
            return ['0.0.0', '0.0.0'];
        }
        return [this.currentVersion, this.latestVersion];
    }
    async getMessage() {
        const [currentVersion, latestVersion] = await this.getVersionPair();
        return (`Major update available for Ionic Framework.\n` +
            `A major update is available for ${color_1.strong('ionic-angular')} (${color_1.ancillary(currentVersion)} => ${color_1.ancillary(latestVersion)}).\n`).trim();
    }
    async detected() {
        const [currentVersion, latestVersion] = await this.getVersionPair();
        const diff = semver.diff(currentVersion, latestVersion);
        return diff === 'major';
    }
    async getTreatmentSteps() {
        return [
            { message: `Visit ${color_1.strong('https://ionicframework.com/blog')} and ${color_1.strong('https://github.com/ionic-team/ionic/releases')} for upgrade instructions` },
        ];
    }
}
exports.IonicAngularMajorUpdateAvailable = IonicAngularMajorUpdateAvailable;
class AppScriptsUpdateAvailable extends IonicAngularAilment {
    constructor() {
        super(...arguments);
        this.id = 'app-scripts-update-available';
        this.treatable = true;
    }
    async getVersionPair() {
        if (!this.currentVersion || !this.latestVersion) {
            const [currentPkg] = await this.project.getPackageJson('@ionic/app-scripts');
            const latestPkg = await npm_1.pkgFromRegistry(this.config.get('npmClient'), { pkg: '@ionic/app-scripts' });
            this.currentVersion = currentPkg ? currentPkg.version : undefined;
            this.latestVersion = latestPkg ? latestPkg.version : undefined;
        }
        if (!this.currentVersion || !this.latestVersion) {
            return ['0.0.0', '0.0.0'];
        }
        return [this.currentVersion, this.latestVersion];
    }
    async getMessage() {
        const [currentVersion, latestVersion] = await this.getVersionPair();
        return (`Update available for ${color_1.strong('@ionic/app-scripts')}.\n` +
            `An update is available for ${color_1.strong('@ionic/app-scripts')} (${color_1.ancillary(currentVersion)} => ${color_1.ancillary(latestVersion)}).\n`).trim();
    }
    async detected() {
        const [currentVersion, latestVersion] = await this.getVersionPair();
        const diff = semver.diff(currentVersion, latestVersion);
        return diff === 'minor' || diff === 'patch';
    }
    async getTreatmentSteps() {
        const [, latestVersion] = await this.getVersionPair();
        const [manager, ...managerArgs] = await npm_1.pkgManagerArgs(this.config.get('npmClient'), { command: 'install', pkg: `@ionic/app-scripts@${latestVersion ? latestVersion : 'latest'}`, saveDev: true });
        return [
            {
                message: `Run: ${color_1.input(manager + ' ' + managerArgs.join(' '))}`,
                treat: async () => {
                    await this.shell.run(manager, managerArgs, {});
                },
            },
        ];
    }
}
exports.AppScriptsUpdateAvailable = AppScriptsUpdateAvailable;
class AppScriptsMajorUpdateAvailable extends IonicAngularAilment {
    constructor() {
        super(...arguments);
        this.id = 'app-scripts-major-update-available';
    }
    async getVersionPair() {
        if (!this.currentVersion || !this.latestVersion) {
            const [currentPkg] = await this.project.getPackageJson('@ionic/app-scripts');
            const latestPkg = await npm_1.pkgFromRegistry(this.config.get('npmClient'), { pkg: '@ionic/app-scripts' });
            this.currentVersion = currentPkg ? currentPkg.version : undefined;
            this.latestVersion = latestPkg ? latestPkg.version : undefined;
        }
        if (!this.currentVersion || !this.latestVersion) {
            return ['0.0.0', '0.0.0'];
        }
        return [this.currentVersion, this.latestVersion];
    }
    async getMessage() {
        const [currentVersion, latestVersion] = await this.getVersionPair();
        return (`Major update available for ${color_1.strong('@ionic/app-scripts')}.\n` +
            `A major update is available for ${color_1.strong('@ionic/app-scripts')} (${color_1.ancillary(currentVersion)} => ${color_1.ancillary(latestVersion)}).\n`).trim();
    }
    async detected() {
        const [currentVersion, latestVersion] = await this.getVersionPair();
        const diff = semver.diff(currentVersion, latestVersion);
        return diff === 'major';
    }
    async getTreatmentSteps() {
        return [
            { message: `Visit ${color_1.strong('https://github.com/ionic-team/ionic-app-scripts/releases')} for upgrade instructions` },
        ];
    }
}
exports.AppScriptsMajorUpdateAvailable = AppScriptsMajorUpdateAvailable;
class IonicAngularPackageJsonHasDefaultIonicBuildCommand extends IonicAngularAilment {
    constructor() {
        super(...arguments);
        this.id = 'ionic-angular-package-json-has-default-ionic-build-command';
    }
    async getMessage() {
        return (`The ${color_1.strong(build_1.BUILD_SCRIPT)} npm script is unchanged.\n` +
            `The Ionic CLI now looks for the ${color_1.strong(build_1.BUILD_SCRIPT)} npm script in ${color_1.strong('package.json')} for a custom build script to run instead of the default (${color_1.input(build_2.DEFAULT_BUILD_SCRIPT_VALUE)}). If you don't use it, it's considered quicker and cleaner to just remove it.`).trim();
    }
    async detected() {
        const pkg = await this.project.requirePackageJson();
        if (pkg.scripts && pkg.scripts[build_1.BUILD_SCRIPT] === build_2.DEFAULT_BUILD_SCRIPT_VALUE) {
            return true;
        }
        return false;
    }
    async getTreatmentSteps() {
        return [
            { message: `Remove the ${color_1.strong(build_1.BUILD_SCRIPT)} npm script from ${color_1.strong('package.json')}` },
            { message: `Continue using ${color_1.input('ionic build')} normally` },
        ];
    }
}
exports.IonicAngularPackageJsonHasDefaultIonicBuildCommand = IonicAngularPackageJsonHasDefaultIonicBuildCommand;
class IonicAngularPackageJsonHasDefaultIonicServeCommand extends IonicAngularAilment {
    constructor() {
        super(...arguments);
        this.id = 'ionic-angular-package-json-has-default-ionic-serve-command';
    }
    async getMessage() {
        return (`The ${color_1.strong(serve_1.SERVE_SCRIPT)} npm script is unchanged.\n` +
            `The Ionic CLI now looks for the ${color_1.strong(serve_1.SERVE_SCRIPT)} npm script in ${color_1.strong('package.json')} for a custom serve script to run instead of the default (${color_1.input(serve_2.DEFAULT_SERVE_SCRIPT_VALUE)}). If you don't use it, it's considered quicker and cleaner to just remove it.`).trim();
    }
    async detected() {
        const pkg = await this.project.requirePackageJson();
        if (pkg.scripts && pkg.scripts[serve_1.SERVE_SCRIPT] === serve_2.DEFAULT_SERVE_SCRIPT_VALUE) {
            return true;
        }
        return false;
    }
    async getTreatmentSteps() {
        return [
            { message: `Remove the ${color_1.strong(serve_1.SERVE_SCRIPT)} npm script from ${color_1.strong('package.json')}` },
            { message: `Continue using ${color_1.input('ionic serve')} normally` },
        ];
    }
}
exports.IonicAngularPackageJsonHasDefaultIonicServeCommand = IonicAngularPackageJsonHasDefaultIonicServeCommand;
