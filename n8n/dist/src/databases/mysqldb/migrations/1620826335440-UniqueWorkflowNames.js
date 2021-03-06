"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueWorkflowNames1620826335440 = void 0;
const config = require("../../../../config");
class UniqueWorkflowNames1620826335440 {
    constructor() {
        this.name = 'UniqueWorkflowNames1620826335440';
    }
    async up(queryRunner) {
        const tablePrefix = config.get('database.tablePrefix');
        const workflowNames = await queryRunner.query(`
				SELECT name
				FROM ${tablePrefix}workflow_entity
			`);
        for (const { name } of workflowNames) {
            const [duplicatesQuery, parameters] = queryRunner.connection.driver.escapeQueryWithParameters(`
					SELECT id, name
					FROM ${tablePrefix}workflow_entity
					WHERE name = :name
					ORDER BY createdAt ASC
				`, { name }, {});
            const duplicates = await queryRunner.query(duplicatesQuery, parameters);
            if (duplicates.length > 1) {
                await Promise.all(duplicates.map(({ id, name }, index) => {
                    if (index === 0)
                        return Promise.resolve();
                    const [updateQuery, updateParams] = queryRunner.connection.driver.escapeQueryWithParameters(`
							UPDATE ${tablePrefix}workflow_entity
							SET name = :name
							WHERE id = '${id}'
						`, { name: `${name} ${index + 1}` }, {});
                    return queryRunner.query(updateQuery, updateParams);
                }));
            }
        }
        await queryRunner.query('ALTER TABLE `' + tablePrefix + 'workflow_entity` ADD UNIQUE INDEX `IDX_' + tablePrefix + '943d8f922be094eb507cb9a7f9` (`name`)');
    }
    async down(queryRunner) {
        const tablePrefix = config.get('database.tablePrefix');
        await queryRunner.query('ALTER TABLE `' + tablePrefix + 'workflow_entity` DROP INDEX `IDX_' + tablePrefix + '943d8f922be094eb507cb9a7f9`');
    }
}
exports.UniqueWorkflowNames1620826335440 = UniqueWorkflowNames1620826335440;
//# sourceMappingURL=1620826335440-UniqueWorkflowNames.js.map