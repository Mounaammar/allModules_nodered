"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookModel1592447867632 = void 0;
const config = require("../../../../config");
class WebhookModel1592447867632 {
    constructor() {
        this.name = 'WebhookModel1592447867632';
    }
    async up(queryRunner) {
        const tablePrefix = config.get('database.tablePrefix');
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${tablePrefix}webhook_entity (workflowId int NOT NULL, webhookPath varchar(255) NOT NULL, method varchar(255) NOT NULL, node varchar(255) NOT NULL, PRIMARY KEY (webhookPath, method)) ENGINE=InnoDB`);
    }
    async down(queryRunner) {
        const tablePrefix = config.get('database.tablePrefix');
        await queryRunner.query(`DROP TABLE ${tablePrefix}webhook_entity`);
    }
}
exports.WebhookModel1592447867632 = WebhookModel1592447867632;
//# sourceMappingURL=1592447867632-WebhookModel.js.map