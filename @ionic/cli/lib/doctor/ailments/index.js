"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CordovaPlatformsCommitted = exports.ViewportFitNotSet = exports.DefaultCordovaBundleIdUsed = exports.UnsavedCordovaPlatforms = exports.IonicNativeOldVersionInstalled = exports.GitConfigInvalid = exports.GitNotUsed = exports.IonicCLIInstalledLocally = exports.NpmInstalledLocally = void 0;
const tslib_1 = require("tslib");
const utils_fs_1 = require("@ionic/utils-fs");
const chalk = require("chalk");
const path = require("path");
const app_1 = require("../../app");
const color_1 = require("../../color");
const git_1 = require("../../git");
const config_1 = require("../../integrations/cordova/config");
const project_1 = require("../../integrations/cordova/project");
const npm_1 = require("../../utils/npm");
const base_1 = require("./base");
tslib_1.__exportStar(require("./base"), exports);
tslib_1.__exportStar(require("./utils"), exports);
class NpmInstalledLocally extends base_1.Ailment {
    constructor() {
        super(...arguments);
        this.id = 'npm-installed-locally';
        this.treatable = true;
    }
    async getMessage() {
        return (`${color_1.strong('npm')} is installed locally.\n` +
            `${color_1.strong('npm')} is typically installed globally and may cause some confusion about versions when other CLIs use it.\n`).trim();
    }
    async detected() {
        const pkg = await this.getLocalPackageJson('npm');
        return pkg !== undefined;
    }
    async getTreatmentSteps() {
        const [manager, ...managerArgs] = await npm_1.pkgManagerArgs(this.config.get('npmClient'), { command: 'uninstall', pkg: 'npm' });
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
exports.NpmInstalledLocally = NpmInstalledLocally;
class IonicCLIInstalledLocally extends base_1.Ailment {
    constructor() {
        super(...arguments);
        this.id = 'ionic-installed-locally';
        this.treatable = true;
    }
    async getMessage() {
        return (`The Ionic CLI is installed locally.\n` +
            `While the CLI can run locally, there's no longer a reason to have it installed locally and it may cause some confusion over configuration and versions.\n`).trim();
    }
    async detected() {
        const pkg = await this.getLocalPackageJson('@ionic/cli');
        return pkg !== undefined;
    }
    async getTreatmentSteps() {
        const [manager, ...managerArgs] = await npm_1.pkgManagerArgs(this.config.get('npmClient'), { command: 'uninstall', pkg: '@ionic/cli' });
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
exports.IonicCLIInstalledLocally = IonicCLIInstalledLocally;
class GitNotUsed extends base_1.Ailment {
    constructor() {
        super(...arguments);
        this.id = 'git-not-used';
    }
    async getMessage() {
        return (`Git doesn't appear to be in use.\n` +
            `We highly recommend using source control software such as git (${color_1.strong('https://git-scm.com')}) to track changes in your code throughout time.\n`).trim();
    }
    async detected() {
        if (!(await git_1.isRepoInitialized(this.project.directory))) {
            return true;
        }
        const cmdInstalled = await this.shell.cmdinfo('git', ['--version']);
        if (!cmdInstalled) {
            return true;
        }
        const [revListCount, status] = await Promise.all([
            this.shell.output('git', ['rev-list', '--count', 'HEAD'], { fatalOnError: false, showCommand: false, showError: false }),
            this.shell.output('git', ['status', '--porcelain'], { fatalOnError: false, showCommand: false, showError: false }),
        ]);
        this.debug('rev-list count: %s, status: %s', revListCount.trim(), status);
        if (!revListCount) {
            return true;
        }
        const commitCount = Number(revListCount);
        const changes = Boolean(status);
        return commitCount === 1 && changes;
    }
    async getTreatmentSteps() {
        return [
            { message: `Download git if you don't have it installed: ${color_1.strong('https://git-scm.com/downloads')}` },
            { message: `Learn the basics if you're unfamiliar with git: ${color_1.strong('https://try.github.io')}` },
            { message: `Make your first commit and start tracking code changes! ????` },
        ];
    }
}
exports.GitNotUsed = GitNotUsed;
class GitConfigInvalid extends base_1.Ailment {
    constructor() {
        super(...arguments);
        this.id = 'git-config-invalid';
    }
    async getMessage() {
        const appflowId = await this.project.requireAppflowId();
        return (`App linked to ${color_1.strong(appflowId)} with invalid git configuration.\n` +
            `This app is linked to an app on Ionic (${color_1.strong(appflowId)}), but the git configuration is not valid.\n`).trim();
    }
    async detected() {
        const isLoggedIn = this.session.isLoggedIn();
        if (!isLoggedIn) {
            return false;
        }
        const appflowId = this.project.config.get('id');
        if (!appflowId) {
            return false;
        }
        if (!(await git_1.isRepoInitialized(this.project.directory))) {
            return false;
        }
        const remote = await git_1.getIonicRemote({ shell: this.shell }, this.project.directory);
        if (!remote) {
            return true;
        }
        const token = await this.session.getUserToken();
        const appClient = new app_1.AppClient(token, { client: this.client });
        const app = await appClient.load(appflowId);
        if (app.repo_url !== remote) {
            return true;
        }
        return false;
    }
    async getTreatmentSteps() {
        return [
            { message: `Run: ${color_1.input('ionic git remote')}` },
        ];
    }
}
exports.GitConfigInvalid = GitConfigInvalid;
class IonicNativeOldVersionInstalled extends base_1.Ailment {
    constructor() {
        super(...arguments);
        this.id = 'ionic-native-old-version-installed';
    }
    async getMessage() {
        return (`Old version of Ionic Native installed.\n` +
            `Ionic Native ${color_1.strong('ionic-native')} has been restructured into individual packages under the ${color_1.strong('@ionic-native/')} namespace to allow for better bundling and faster apps.\n`).trim();
    }
    async detected() {
        const pkg = await this.getLocalPackageJson('ionic-native');
        return pkg !== undefined;
    }
    async getTreatmentSteps() {
        const args = await npm_1.pkgManagerArgs(this.config.get('npmClient'), { command: 'uninstall', pkg: 'ionic-native' });
        return [
            { message: `Run ${color_1.input(args.join(' '))}` },
            { message: `Refer to ${color_1.strong('https://ion.link/native-docs')} for installation & usage instructions` },
        ];
    }
}
exports.IonicNativeOldVersionInstalled = IonicNativeOldVersionInstalled;
class UnsavedCordovaPlatforms extends base_1.Ailment {
    constructor() {
        super(...arguments);
        this.id = 'unsaved-cordova-platforms';
    }
    async getMessage() {
        return (`Cordova platforms unsaved.\n` +
            `There are Cordova platforms installed that are not saved in ${color_1.strong('config.xml')} or ${color_1.strong('package.json')}. It is good practice to manage Cordova platforms and their versions. See the Cordova docs${color_1.ancillary('[1]')} for more information.\n\n` +
            `${color_1.ancillary('[1]')}: ${color_1.strong('https://cordova.apache.org/docs/en/latest/platform_plugin_versioning_ref/')}\n`).trim();
    }
    async detected() {
        const cordova = this.project.getIntegration('cordova');
        if (!cordova || !cordova.enabled) {
            return false;
        }
        const platforms = await project_1.getPlatforms(cordova.root);
        const conf = await config_1.loadCordovaConfig(cordova);
        const configuredPlatforms = new Set([...conf.getConfiguredPlatforms().map(e => e.name)]);
        const configXmlDiff = platforms.filter(p => !configuredPlatforms.has(p));
        return configXmlDiff.length > 0;
    }
    async getTreatmentSteps() {
        return [
            { message: `Run: ${color_1.input('ionic cordova platform save')}` },
        ];
    }
}
exports.UnsavedCordovaPlatforms = UnsavedCordovaPlatforms;
class DefaultCordovaBundleIdUsed extends base_1.Ailment {
    constructor() {
        super(...arguments);
        this.id = 'default-cordova-bundle-id-used';
    }
    async getMessage() {
        return (`Package ID unchanged in ${color_1.strong('config.xml')}.\n` +
            `The Package Identifier (AKA "Bundle ID" for iOS and "Application ID" for Android) is a unique ID (usually written in reverse DNS notation, such as ${color_1.strong('com.mycompany.MyApp')}) that Cordova uses when compiling the native build of your app. When your app is submitted to the App Store or Play Store, the Package ID can't be changed. This issue was detected because this app's Package ID is ${color_1.input('"io.ionic.starter"')}, which is the default Package ID provided after running ${color_1.input('ionic start')}.`).trim();
    }
    async detected() {
        const cordova = this.project.getIntegration('cordova');
        if (!cordova || !cordova.enabled) {
            return false;
        }
        const conf = await config_1.loadCordovaConfig(cordova);
        return conf.getBundleId() === 'io.ionic.starter';
    }
    async getTreatmentSteps() {
        return [
            { message: `Change the ${color_1.strong('id')} attribute of ${color_1.strong('<widget>')} (root element) to something other than ${color_1.input('"io.ionic.starter"')}` },
        ];
    }
}
exports.DefaultCordovaBundleIdUsed = DefaultCordovaBundleIdUsed;
class ViewportFitNotSet extends base_1.Ailment {
    constructor() {
        super(...arguments);
        this.id = 'viewport-fit-not-set';
    }
    async getMessage() {
        return (`${color_1.strong('viewport-fit=cover')} not set in ${color_1.strong('index.html')}\n` +
            `iOS 11 introduces new "safe regions" for webviews, which can throw off component sizing, squish the header into the status bar, letterbox the app on iPhone X, etc. Fixing this issue will ensure the webview takes up the full size of the screen. See ${color_1.strong('https://ionicframework.com/blog/ios-11-checklist/')} for more information.`).trim();
    }
    async detected() {
        const indexHtml = await utils_fs_1.readFile(path.resolve(await this.project.getSourceDir(), 'index.html'), { encoding: 'utf8' });
        const m = indexHtml.match(/\<meta([\s]*(name=['"]viewport['"]){1})[\w\d\s\.\-,=]*(content=['"]){1}[\w\d\s\.\-,=]*(viewport-fit=cover){1}[\w\d\s\.\-,='"]+\/?\>/);
        return !Boolean(m);
    }
    async getTreatmentSteps() {
        return [
            { message: `Add ${color_1.strong('viewport-fit=cover')} to the ${color_1.strong('<meta name="viewport">')} tag in your ${color_1.strong('index.html')} file` },
        ];
    }
}
exports.ViewportFitNotSet = ViewportFitNotSet;
class CordovaPlatformsCommitted extends base_1.Ailment {
    constructor() {
        super(...arguments);
        this.id = 'cordova-platforms-committed';
    }
    async getMessage() {
        return (`Cordova ${color_1.strong('platforms/')} directory is committed to git.\n` +
            `Cordova considers ${color_1.strong('platforms/')} and ${color_1.strong('plugins/')} build artifacts${color_1.ancillary('[1]')}, and routinely overwrites files.\n\n` +
            `While committing these files might be necessary for some projects${color_1.ancillary('[2]')}, generally platforms should be configured using ${color_1.strong('config.xml')} and Cordova hooks${color_1.ancillary('[3]')} so that your project is more portable and SDK updates are easier.\n\n` +
            `${color_1.ancillary('[1]')}: ${color_1.strong('https://cordova.apache.org/docs/en/latest/reference/cordova-cli/#version-control')}\n` +
            `${color_1.ancillary('[2]')}: ${color_1.strong('https://cordova.apache.org/docs/en/latest/reference/cordova-cli/#platforms')}\n` +
            `${color_1.ancillary('[3]')}: ${color_1.strong('https://cordova.apache.org/docs/en/latest/guide/appdev/hooks/index.html')}\n\n` +
            `${chalk.yellow(`${color_1.strong('WARNING')}: Attempting to fix this could be dangerous. Only proceed if you're sure you haven't made manual modifications to these files.`)}\n`).trim();
    }
    async detected() {
        if (!(await git_1.isRepoInitialized(this.project.directory))) {
            return false;
        }
        const cmdInstalled = await this.shell.cmdinfo('git', ['--version']);
        if (!cmdInstalled) {
            return false;
        }
        const files = (await this.shell.output('git', ['ls-tree', '--name-only', 'HEAD'], { fatalOnError: false, showCommand: false, showError: false })).split('\n');
        return files.includes('platforms'); // TODO
    }
    async getTreatmentSteps() {
        return [
            { message: `Remove ${color_1.strong('platforms/')} from source control: ${color_1.input('git rm -rf platforms/')} and ${color_1.input('git commit')}` },
            { message: `Make sure the ${color_1.strong('platforms/')} directory has been removed: ${color_1.input('rm -rf platforms/')}` },
            { message: `Allow Cordova to repopulate your platforms: ${color_1.input('ionic cordova prepare')}` },
        ];
    }
}
exports.CordovaPlatformsCommitted = CordovaPlatformsCommitted;
