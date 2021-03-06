"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_SCRIPTS_OPTIONS = exports.importAppScripts = void 0;
const node_1 = require("@ionic/cli-framework/utils/node");
const Debug = require("debug");
const color_1 = require("../../color");
const debug = Debug('ionic:lib:project:ionic-angular:app-scripts');
async function importAppScripts(projectDir) {
    const pkg = '@ionic/app-scripts';
    debug('Importing %s', pkg);
    const p = require.resolve(pkg, { paths: node_1.compileNodeModulesPaths(projectDir) });
    const m = require(p);
    debug('fin');
    return m;
}
exports.importAppScripts = importAppScripts;
exports.APP_SCRIPTS_OPTIONS = [
    {
        name: 'prod',
        summary: 'Build the application for production',
        type: Boolean,
        groups: ['app-scripts', 'cordova'],
        hint: color_1.weak('[app-scripts]'),
    },
    {
        name: 'aot',
        summary: 'Perform ahead-of-time compilation for this build',
        type: Boolean,
        groups: ["advanced" /* ADVANCED */, 'app-scripts', 'cordova'],
        hint: color_1.weak('[app-scripts]'),
    },
    {
        name: 'minifyjs',
        summary: 'Minify JS for this build',
        type: Boolean,
        groups: ["advanced" /* ADVANCED */, 'app-scripts', 'cordova'],
        hint: color_1.weak('[app-scripts]'),
    },
    {
        name: 'minifycss',
        summary: 'Minify CSS for this build',
        type: Boolean,
        groups: ["advanced" /* ADVANCED */, 'app-scripts', 'cordova'],
        hint: color_1.weak('[app-scripts]'),
    },
    {
        name: 'optimizejs',
        summary: 'Perform JS optimizations for this build',
        type: Boolean,
        groups: ["advanced" /* ADVANCED */, 'app-scripts', 'cordova'],
        hint: color_1.weak('[app-scripts]'),
    },
    {
        name: 'env',
        summary: '',
        groups: ["hidden" /* HIDDEN */, "advanced" /* ADVANCED */, 'app-scripts', 'cordova'],
        hint: color_1.weak('[app-scripts]'),
    },
];
