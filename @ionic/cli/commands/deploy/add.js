"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCommand = void 0;
const color_1 = require("../../lib/color");
const executor_1 = require("../../lib/executor");
const core_1 = require("./core");
class AddCommand extends core_1.DeployConfCommand {
    async getMetadata() {
        return {
            name: 'add',
            type: 'project',
            groups: ["paid" /* PAID */],
            summary: 'Adds Appflow Deploy to the project',
            description: `
This command adds the Appflow Deploy plugin (${color_1.input('cordova-plugin-ionic')}) for both Capacitor and Cordova projects.

For Capacitor projects it runs all the steps necessary to install the plugin, sync with the native projects and add the configuration to the proper iOS and Android configuration files.

For Cordova projects it just takes care of running the proper Cordova CLI command with the submitted parameters.
      `,
            exampleCommands: [
                '',
                '--app-id=abcd1234 --channel-name="Master" --update-method=background',
                '--max-store=2 --min-background-duration=30',
                '--app-id=abcd1234 --channel-name="Master" --update-method=background --max-store=2 --min-background-duration=30',
            ],
            options: [
                {
                    name: 'app-id',
                    summary: 'Your Appflow app ID',
                    type: String,
                    spec: { value: 'id' },
                },
                {
                    name: 'channel-name',
                    summary: 'The channel to check for updates from',
                    type: String,
                    spec: { value: 'name' },
                },
                {
                    name: 'update-method',
                    summary: 'The update method that dictates the behavior of the plugin',
                    type: String,
                    spec: { value: 'name' },
                },
                {
                    name: 'max-store',
                    summary: 'The maximum number of downloaded versions to store on the device',
                    type: String,
                    groups: ["advanced" /* ADVANCED */],
                    spec: { value: 'quantity' },
                    default: '2',
                },
                {
                    name: 'min-background-duration',
                    summary: 'The minimum duration after which the app checks for an update in the background',
                    type: String,
                    groups: ["advanced" /* ADVANCED */],
                    spec: { value: 'seconds' },
                    default: '30',
                },
                {
                    name: 'update-api',
                    summary: 'The location of the Appflow API',
                    type: String,
                    groups: ["hidden" /* HIDDEN */],
                    spec: { value: 'url' },
                    default: 'https://api.ionicjs.com',
                },
            ],
        };
    }
    buildCordovaDeployOptions(options) {
        const optionsToCordova = {
            'app-id': 'APP_ID',
            'channel-name': 'CHANNEL_NAME',
            'update-method': 'UPDATE_METHOD',
            'max-store': 'MAX_STORE',
            'min-background-duration': 'MIN_BACKGROUND_DURATION',
            'update-api': 'UPDATE_API',
        };
        const outputOptions = [];
        for (const [optionKey, cordovaKey] of Object.entries(optionsToCordova)) {
            if (options[optionKey]) {
                outputOptions.push(`--variable`);
                outputOptions.push(`${cordovaKey}=${options[optionKey]}`);
            }
        }
        return outputOptions;
    }
    async preRun(inputs, options) {
        // check if there are native integration installed
        await this.requireNativeIntegration();
        await this.preRunCheckInputs(options);
    }
    async addPlugin(options, runinfo, integration) {
        if (integration === 'cordova') {
            let deployCommand = ['cordova', 'plugin', 'add', 'cordova-plugin-ionic'];
            const userOptions = this.buildCordovaDeployOptions(options);
            if (userOptions) {
                deployCommand = deployCommand.concat(userOptions);
            }
            await executor_1.runCommand(runinfo, deployCommand);
        }
        if (integration === 'capacitor') {
            const { pkgManagerArgs } = await Promise.resolve().then(() => require('../../lib/utils/npm'));
            const [installer, ...installerArgs] = await pkgManagerArgs(this.env.config.get('npmClient'), { command: 'install', pkg: 'cordova-plugin-ionic' });
            // install the plugin with npm
            await this.env.shell.run(installer, installerArgs, { stdio: 'inherit' });
        }
    }
    async run(inputs, options, runinfo) {
        const integration = await this.getAppIntegration();
        // check if it is already installed
        const alreadyAdded = await this.checkDeployInstalled();
        if (!alreadyAdded) {
            await this.addPlugin(options, runinfo, integration);
        }
        else {
            this.env.log.warn("Live Updates plugin already added. Reconfiguring only.");
        }
        if (integration === 'capacitor') {
            // generate the manifest
            await executor_1.runCommand(runinfo, ['deploy', 'manifest']);
            // run capacitor sync
            await executor_1.runCommand(runinfo, ['capacitor', 'sync']);
            // update the ios project if present
            await this.addConfToIosPlist(options);
            // update the android project if present
            await this.addConfToAndroidString(options);
        }
        this.env.log.ok(`Appflow Deploy plugin added to the project!\n`);
    }
}
exports.AddCommand = AddCommand;
