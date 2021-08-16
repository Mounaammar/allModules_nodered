"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookModel1592445003908 = void 0;
const config = require("../../../../config");
class WebhookModel1592445003908 {
    constructor() {
        this.name = 'WebhookModel1592445003908';
    }
    async up(queryRunner) {
        const tablePrefix = config.get('database.tablePrefix');
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${tablePrefix}webhook_entity ("workflowId" integer NOT NULL, "webhookPath" varchar NOT NULL, "method" varchar NOT NULL, "node" varchar NOT NULL, PRIMARY KEY ("webhookPath", "method"))`);
    }
    async down(queryRunner) {
        const tablePrefix = config.get('database.tablePrefix');
        await queryRunner.query(`DROP TABLE ${tablePrefix}webhook_entity`);
    }
}
exports.WebhookModel1592445003908 = WebhookModel1592445003908;
//# sourceMappingURL=1592445003908-WebhookModel.js.map