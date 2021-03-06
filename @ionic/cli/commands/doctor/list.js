"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorListCommand = void 0;
const string_1 = require("@ionic/cli-framework/utils/string");
const utils_terminal_1 = require("@ionic/utils-terminal");
const constants_1 = require("../../constants");
const guards_1 = require("../../guards");
const color_1 = require("../../lib/color");
const base_1 = require("./base");
class DoctorListCommand extends base_1.DoctorCommand {
    async getMetadata() {
        return {
            name: 'list',
            type: 'project',
            summary: 'List all issues and their identifiers',
            description: `
Issues can have various tags:
- ${color_1.strong('treatable')}: ${color_1.input('ionic doctor treat')} can attempt to fix the issue
- ${color_1.strong('ignored')}: configured not to be detected in ${color_1.input('ionic doctor check')} or ${color_1.input('ionic doctor treat')}
- ${color_1.strong('explicit-detection')}: issue is only detected explicitly with ${color_1.input('ionic doctor check <issue-id>')}

You can flip whether an issue is ignored or not by using ${color_1.input('ionic config set -g doctor.issues.<issue-id>.ignored true/false')}, where ${color_1.input('<issue-id>')} matches an ID listed with this command.
      `,
        };
    }
    async run(inputs, options) {
        const registry = await this.getRegistry();
        const rows = registry.ailments.map(ailment => {
            const tags = [];
            const ignored = this.env.config.get(`doctor.issues.${ailment.id}.ignored`);
            if (ignored) {
                tags.push('ignored');
            }
            if (guards_1.isTreatableAilment(ailment)) {
                tags.push('treatable');
            }
            if (!ailment.implicit) {
                tags.push('explicit-detection');
            }
            return [
                color_1.input(ailment.id),
                ailment.projects ? ailment.projects.map(t => color_1.strong(t)).join(', ') : 'all',
                tags.map(t => color_1.strong(t)).join(', '),
            ];
        });
        rows.sort((row1, row2) => string_1.strcmp(row1[0], row2[0]));
        this.env.log.rawmsg(utils_terminal_1.columnar(rows, { ...constants_1.COLUMNAR_OPTIONS, headers: ['id', 'affected projects', 'tags'].map(h => color_1.strong(h)) }));
    }
}
exports.DoctorListCommand = DoctorListCommand;
