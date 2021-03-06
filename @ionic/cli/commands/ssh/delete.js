"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSHDeleteCommand = void 0;
const cli_framework_1 = require("@ionic/cli-framework");
const color_1 = require("../../lib/color");
const base_1 = require("./base");
class SSHDeleteCommand extends base_1.SSHBaseCommand {
    async getMetadata() {
        return {
            name: 'delete',
            type: 'global',
            summary: 'Delete an SSH public key from Ionic',
            inputs: [
                {
                    name: 'key-id',
                    summary: 'The ID of the public key to delete',
                    validators: [cli_framework_1.validators.required],
                },
            ],
        };
    }
    async preRun(inputs, options) {
        const { SSHKeyClient } = await Promise.resolve().then(() => require('../../lib/ssh'));
        if (!inputs[0]) {
            const user = this.env.session.getUser();
            const token = await this.env.session.getUserToken();
            const sshkeyClient = new SSHKeyClient({ client: this.env.client, user, token });
            const paginator = sshkeyClient.paginate();
            const [r] = paginator;
            const res = await r;
            if (res.data.length === 0) {
                this.env.log.warn(`No SSH keys found. Use ${color_1.input('ionic ssh add')} to add keys to Ionic.`);
            }
            inputs[0] = await this.env.prompt({
                type: 'list',
                name: 'id',
                message: 'Which SSH keys would you like to delete from Ionic?',
                choices: res.data.map(key => ({
                    name: `${key.fingerprint} ${key.name} ${key.annotation}`,
                    value: key.id,
                })),
            });
        }
    }
    async run(inputs, options) {
        const { SSHKeyClient } = await Promise.resolve().then(() => require('../../lib/ssh'));
        const [id] = inputs;
        const user = this.env.session.getUser();
        const token = await this.env.session.getUserToken();
        const sshkeyClient = new SSHKeyClient({ client: this.env.client, user, token });
        await sshkeyClient.delete(id);
        this.env.log.ok(`Your public key (${color_1.strong(id)}) has been removed from Ionic.`);
    }
}
exports.SSHDeleteCommand = SSHDeleteCommand;
