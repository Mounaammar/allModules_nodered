"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VueProject = void 0;
const chalk = require("chalk");
const Debug = require("debug");
const lodash = require("lodash");
const path = require("path");
const __1 = require("../");
const errors_1 = require("../../errors");
const debug = Debug('ionic:lib:project:vue');
class VueProject extends __1.Project {
    constructor() {
        super(...arguments);
        this.type = 'vue';
    }
    async getInfo() {
        const [[ionicVuePkg, ionicVuePkgPath],] = await Promise.all([
            this.getPackageJson('@ionic/vue'),
        ]);
        return [
            ...(await super.getInfo()),
            {
                group: 'ionic',
                name: 'Ionic Framework',
                key: 'framework',
                value: ionicVuePkg ? `@ionic/vue ${ionicVuePkg.version}` : 'not installed',
                path: ionicVuePkgPath,
            },
        ];
    }
    /**
     * We can't detect Vue project types. We don't know what they look like!
     */
    async detected() {
        try {
            const pkg = await this.requirePackageJson();
            const deps = lodash.assign({}, pkg.dependencies, pkg.devDependencies);
            if (typeof deps['@ionic/vue'] === 'string') {
                debug(`${chalk.bold('@ionic/vue')} detected in ${chalk.bold('package.json')}`);
                return true;
            }
        }
        catch (e) {
            // ignore
        }
        return false;
    }
    async getDefaultDistDir() {
        return 'dist';
    }
    async requireBuildRunner() {
        const { VueBuildRunner } = await Promise.resolve().then(() => require('./build'));
        const deps = { ...this.e, project: this };
        return new VueBuildRunner(deps);
    }
    async requireServeRunner() {
        const { VueServeRunner } = await Promise.resolve().then(() => require('./serve'));
        const deps = { ...this.e, project: this };
        return new VueServeRunner(deps);
    }
    async requireGenerateRunner() {
        throw new errors_1.RunnerNotFoundException(`Cannot perform generate for Vue projects.\n` +
            `Since you're using the ${chalk.bold('Vue')} project type, this command won't work. The Ionic CLI doesn't know how to generate framework components for Vue projects.`);
    }
    setPrimaryTheme(themeColor) {
        const themePath = path.join(this.directory, 'src', 'theme', 'variables.css');
        return this.writeThemeColor(themePath, themeColor);
    }
}
exports.VueProject = VueProject;
