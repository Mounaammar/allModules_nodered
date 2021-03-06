"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSLGenerateCommand = void 0;
const utils_fs_1 = require("@ionic/utils-fs");
const utils_terminal_1 = require("@ionic/utils-terminal");
const lodash = require("lodash");
const path = require("path");
const color_1 = require("../../lib/color");
const errors_1 = require("../../lib/errors");
const base_1 = require("./base");
const DEFAULT_BITS = '2048';
const DEFAULT_COUNTRY_NAME = 'US';
const DEFAULT_STATE_OR_PROVINCE_NAME = 'Wisconsin';
const DEFAULT_LOCALITY_NAME = 'Madison';
const DEFAULT_ORGANIZATION_NAME = 'Ionic';
const DEFAULT_COMMON_NAME = 'localhost';
const DEFAULT_KEY_FILE = '.ionic/ssl/key.pem';
const DEFAULT_CERT_FILE = '.ionic/ssl/cert.pem';
class SSLGenerateCommand extends base_1.SSLBaseCommand {
    getDefaultKeyPath() {
        return path.resolve(this.project ? this.project.directory : '', DEFAULT_KEY_FILE);
    }
    getDefaultCertPath() {
        return path.resolve(this.project ? this.project.directory : '', DEFAULT_CERT_FILE);
    }
    async getMetadata() {
        const defaultKeyPath = utils_terminal_1.prettyPath(this.getDefaultKeyPath());
        const defaultCertPath = utils_terminal_1.prettyPath(this.getDefaultCertPath());
        return {
            name: 'generate',
            type: 'project',
            summary: 'Generates an SSL key & certificate',
            // TODO: document how to add trusted certs
            description: `
Uses OpenSSL to create a self-signed certificate for ${color_1.strong('localhost')} (by default).

After the certificate is generated, you will still need to add it to your system or browser as a trusted certificate.

The default directory for ${color_1.input('--key-path')} and ${color_1.input('--cert-path')} is ${color_1.input('.ionic/ssl/')}.
      `,
            options: [
                {
                    name: 'key-path',
                    summary: 'Destination of private key file',
                    default: defaultKeyPath,
                    spec: { value: 'path' },
                },
                {
                    name: 'cert-path',
                    summary: 'Destination of certificate file',
                    default: defaultCertPath,
                    spec: { value: 'path' },
                },
                {
                    name: 'country-name',
                    summary: 'The country name (C) of the SSL certificate',
                    default: DEFAULT_COUNTRY_NAME,
                    groups: ["advanced" /* ADVANCED */],
                    spec: { value: 'C' },
                },
                {
                    name: 'state-or-province-name',
                    summary: 'The state or province name (ST) of the SSL certificate',
                    default: DEFAULT_STATE_OR_PROVINCE_NAME,
                    groups: ["advanced" /* ADVANCED */],
                    spec: { value: 'ST' },
                },
                {
                    name: 'locality-name',
                    summary: 'The locality name (L) of the SSL certificate',
                    default: DEFAULT_LOCALITY_NAME,
                    groups: ["advanced" /* ADVANCED */],
                    spec: { value: 'L' },
                },
                {
                    name: 'organization-name',
                    summary: 'The organization name (O) of the SSL certificate',
                    default: DEFAULT_ORGANIZATION_NAME,
                    groups: ["advanced" /* ADVANCED */],
                    spec: { value: 'O' },
                },
                {
                    name: 'common-name',
                    summary: 'The common name (CN) of the SSL certificate',
                    default: DEFAULT_COMMON_NAME,
                    groups: ["advanced" /* ADVANCED */],
                    spec: { value: 'CN' },
                },
                {
                    name: 'bits',
                    summary: 'Number of bits in the key',
                    aliases: ['b'],
                    default: DEFAULT_BITS,
                    groups: ["advanced" /* ADVANCED */],
                },
            ],
            groups: ["experimental" /* EXPERIMENTAL */],
        };
    }
    async preRun(inputs, options) {
        await this.checkForOpenSSL();
    }
    async run(inputs, options) {
        if (!this.project) {
            throw new errors_1.FatalException(`Cannot run ${color_1.input('ionic ssl generate')} outside a project directory.`);
        }
        const keyPath = path.resolve(options['key-path'] ? String(options['key-path']) : this.getDefaultKeyPath());
        const keyPathDir = path.dirname(keyPath);
        const certPath = path.resolve(options['cert-path'] ? String(options['cert-path']) : this.getDefaultCertPath());
        const certPathDir = path.dirname(certPath);
        const bits = options['bits'] ? String(options['bits']) : DEFAULT_BITS;
        const countryName = options['country-name'] ? String(options['country-name']) : DEFAULT_COUNTRY_NAME;
        const stateOrProvinceName = options['state-or-province-name'] ? String(options['state-or-province-name']) : DEFAULT_STATE_OR_PROVINCE_NAME;
        const localityName = options['locality-name'] ? String(options['locality-name']) : DEFAULT_LOCALITY_NAME;
        const organizationName = options['organization-name'] ? String(options['organization-name']) : DEFAULT_ORGANIZATION_NAME;
        const commonName = options['common-name'] ? String(options['common-name']) : DEFAULT_COMMON_NAME;
        await this.ensureDirectory(keyPathDir);
        await this.ensureDirectory(certPathDir);
        const overwriteKeyPath = await this.checkExistingFile(keyPath);
        const overwriteCertPath = await this.checkExistingFile(certPath);
        if (overwriteKeyPath) {
            await utils_fs_1.unlink(keyPath);
        }
        if (overwriteCertPath) {
            await utils_fs_1.unlink(certPath);
        }
        const cnf = { bits, countryName, stateOrProvinceName, localityName, organizationName, commonName };
        const cnfPath = await this.writeConfig(cnf);
        await this.env.shell.run('openssl', ['req', '-x509', '-newkey', `rsa:${bits}`, '-nodes', '-subj', this.formatSubj(cnf), '-reqexts', 'SAN', '-extensions', 'SAN', '-config', cnfPath, '-days', '365', '-keyout', keyPath, '-out', certPath], {});
        this.env.log.nl();
        this.env.log.rawmsg(`Key:  ${color_1.strong(utils_terminal_1.prettyPath(keyPath))}\n` +
            `Cert: ${color_1.strong(utils_terminal_1.prettyPath(certPath))}\n\n`);
        this.env.log.ok('Generated key & certificate!');
    }
    formatSubj(cnf) {
        const subjNames = new Map([
            ['countryName', 'C'],
            ['stateOrProvinceName', 'ST'],
            ['localityName', 'L'],
            ['organizationName', 'O'],
            ['commonName', 'CN'],
        ]);
        return '/' + lodash.toPairs(cnf).filter(([k]) => subjNames.has(k)).map(([k, v]) => `${subjNames.get(k)}=${v}`).join('/');
    }
    async ensureDirectory(p) {
        if (!(await utils_fs_1.pathExists(p))) {
            await utils_fs_1.mkdirp(p, 0o700);
            this.env.log.msg(`Created ${color_1.strong(utils_terminal_1.prettyPath(p))} directory for you.`);
        }
    }
    async checkExistingFile(p) {
        if (await utils_fs_1.pathExists(p)) {
            const confirm = await this.env.prompt({
                type: 'confirm',
                name: 'confirm',
                message: `Key ${color_1.strong(utils_terminal_1.prettyPath(p))} exists. Overwrite?`,
            });
            if (confirm) {
                return true;
            }
            else {
                throw new errors_1.FatalException(`Not overwriting ${color_1.strong(utils_terminal_1.prettyPath(p))}.`);
            }
        }
    }
    async writeConfig({ bits, countryName, stateOrProvinceName, localityName, organizationName, commonName }) {
        const cnf = `
[req]
default_bits       = ${bits}
distinguished_name = req_distinguished_name

[req_distinguished_name]
countryName                = ${countryName}
stateOrProvinceName        = ${stateOrProvinceName}
localityName               = ${localityName}
organizationName           = ${organizationName}
commonName                 = ${commonName}

[SAN]
subjectAltName=DNS:${commonName}
`.trim();
        const p = utils_fs_1.tmpfilepath('ionic-ssl');
        await utils_fs_1.writeFile(p, cnf, { encoding: 'utf8' });
        return p;
    }
}
exports.SSLGenerateCommand = SSLGenerateCommand;
