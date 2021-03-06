"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsDisableCommand = void 0;
const cli_framework_1 = require("@ionic/cli-framework");
const guards_1 = require("../../guards");
const color_1 = require("../../lib/color");
const command_1 = require("../../lib/command");
const errors_1 = require("../../lib/errors");
const integrations_1 = require("../../lib/integrations");
class IntegrationsDisableCommand extends command_1.Command {
    async getMetadata() {
        return {
            name: 'disable',
            type: 'project',
            summary: 'Disable an integration',
            description: `
Integrations, such as Cordova, can be disabled with this command.
      `,
            inputs: [
                {
                    name: 'name',
                    summary: `The integration to disable (e.g. ${integrations_1.INTEGRATION_NAMES.map(i => color_1.input(i)).join(', ')})`,
                    validators: [cli_framework_1.validators.required, cli_framework_1.contains(integrations_1.INTEGRATION_NAMES, {})],
                },
            ],
        };
    }
    async run(inputs, options) {
        const [name] = inputs;
        if (!this.project) {
            throw new errors_1.FatalException(`Cannot run ${color_1.input('ionic integrations disable')} outside a project directory.`);
        }
        if (!guards_1.isIntegrationName(name)) {
            throw new errors_1.FatalException(`Don't know about ${color_1.input(name)} integration!`);
        }
        const integration = await this.project.createIntegration(name);
        try {
            if (!integration.isAdded() || !integration.isEnabled()) {
                this.env.log.info(`Integration ${color_1.input(name)} already disabled.`);
            }
            else {
                await integration.disable();
                this.env.log.ok(`Integration ${color_1.input(name)} disabled!`);
            }
        }
        catch (e) {
            if (e instanceof cli_framework_1.BaseError) {
                throw new errors_1.FatalException(e.message);
            }
            throw e;
        }
    }
}
exports.IntegrationsDisableCommand = IntegrationsDisableCommand;
