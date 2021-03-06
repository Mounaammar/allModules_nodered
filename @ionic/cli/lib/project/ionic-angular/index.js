"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IonicAngularProject = void 0;
const Debug = require("debug");
const lodash = require("lodash");
const __1 = require("../");
const color_1 = require("../../color");
const debug = Debug('ionic:lib:project:ionic-angular');
class IonicAngularProject extends __1.Project {
    constructor() {
        super(...arguments);
        this.type = 'ionic-angular';
    }
    async getInfo() {
        const [[ionicAngularPkg], [appScriptsPkg],] = await Promise.all([
            this.getPackageJson('ionic-angular'),
            this.getPackageJson('@ionic/app-scripts'),
        ]);
        return [
            ...(await super.getInfo()),
            {
                group: 'ionic',
                name: 'Ionic Framework',
                key: 'framework',
                value: ionicAngularPkg ? `ionic-angular ${ionicAngularPkg.version}` : 'not installed',
            },
            {
                group: 'ionic',
                name: '@ionic/app-scripts',
                key: 'app_scripts_version',
                value: appScriptsPkg ? appScriptsPkg.version : 'not installed',
            },
        ];
    }
    async getDocsUrl() {
        return 'https://ion.link/v3-docs';
    }
    async registerAilments(registry) {
        await super.registerAilments(registry);
        const ailments = await Promise.resolve().then(() => require('./ailments'));
        const deps = { ...this.e, project: this };
        registry.register(new ailments.IonicAngularUpdateAvailable(deps));
        registry.register(new ailments.IonicAngularMajorUpdateAvailable(deps));
        registry.register(new ailments.AppScriptsUpdateAvailable(deps));
        registry.register(new ailments.AppScriptsMajorUpdateAvailable(deps));
        registry.register(new ailments.IonicAngularPackageJsonHasDefaultIonicBuildCommand(deps));
        registry.register(new ailments.IonicAngularPackageJsonHasDefaultIonicServeCommand(deps));
    }
    async detected() {
        try {
            const pkg = await this.requirePackageJson();
            const deps = lodash.assign({}, pkg.dependencies, pkg.devDependencies);
            if (typeof deps['ionic-angular'] === 'string') {
                debug(`${color_1.strong('ionic-angular')} detected in ${color_1.strong('package.json')}`);
                return true;
            }
        }
        catch (e) {
            // ignore
        }
        return false;
    }
    async requireBuildRunner() {
        const { IonicAngularBuildRunner } = await Promise.resolve().then(() => require('./build'));
        const deps = { ...this.e, project: this };
        return new IonicAngularBuildRunner(deps);
    }
    async requireServeRunner() {
        const { IonicAngularServeRunner } = await Promise.resolve().then(() => require('./serve'));
        const deps = { ...this.e, project: this };
        return new IonicAngularServeRunner(deps);
    }
    async requireGenerateRunner() {
        const { IonicAngularGenerateRunner } = await Promise.resolve().then(() => require('./generate'));
        const deps = { ...this.e, project: this };
        return new IonicAngularGenerateRunner(deps);
    }
}
exports.IonicAngularProject = IonicAngularProject;
