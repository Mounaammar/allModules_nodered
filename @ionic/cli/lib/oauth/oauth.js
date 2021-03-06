"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuth2Flow = void 0;
const utils_fs_1 = require("@ionic/utils-fs");
const utils_network_1 = require("@ionic/utils-network");
const crypto = require("crypto");
const http = require("http");
const path = require("path");
const qs = require("querystring");
const constants_1 = require("../../constants");
const errors_1 = require("../errors");
const http_1 = require("../http");
const open_1 = require("../open");
const REDIRECT_PORT = 8123;
const REDIRECT_HOST = 'localhost';
class OAuth2Flow {
    constructor({ redirectHost = REDIRECT_HOST, redirectPort = REDIRECT_PORT, accessTokenRequestContentType = "application/json" /* JSON */ }, e) {
        this.e = e;
        this.oauthConfig = this.getAuthConfig();
        this.redirectHost = redirectHost;
        this.redirectPort = redirectPort;
        this.accessTokenRequestContentType = accessTokenRequestContentType;
    }
    get redirectUrl() {
        return `http://${this.redirectHost}:${this.redirectPort}`;
    }
    async run() {
        const verifier = this.generateVerifier();
        const challenge = this.generateChallenge(verifier);
        const authorizationParams = this.generateAuthorizationParameters(challenge);
        const authorizationUrl = `${this.oauthConfig.authorizationUrl}?${qs.stringify(authorizationParams)}`;
        await open_1.openUrl(authorizationUrl);
        const authorizationCode = await this.getAuthorizationCode();
        const token = await this.exchangeAuthForAccessToken(authorizationCode, verifier);
        return token;
    }
    async exchangeRefreshToken(refreshToken) {
        const params = this.generateRefreshTokenParameters(refreshToken);
        const { req } = await this.e.client.make('POST', this.oauthConfig.tokenUrl, this.accessTokenRequestContentType);
        const res = await req.send(params);
        // check the response status code first here
        if (!res.ok) {
            throw new errors_1.FatalException('API request to refresh token was not successful.\n' +
                'Please try to login again.\n' +
                http_1.formatResponseError(req, res.status));
        }
        if (!this.checkValidExchangeTokenRes(res)) {
            throw new errors_1.FatalException('API request was successful, but the refreshed token was unrecognized.\n' +
                'Please try to login again.\n');
        }
        return res.body;
    }
    async getSuccessHtml() {
        const p = path.resolve(constants_1.ASSETS_DIRECTORY, 'oauth', 'success', 'index.html');
        const contents = await utils_fs_1.readFile(p, { encoding: 'utf8' });
        return contents;
    }
    async getAuthorizationCode() {
        if (!(await utils_network_1.isPortAvailable(this.redirectPort))) {
            throw new Error(`Cannot start local server. Port ${this.redirectPort} is in use.`);
        }
        const successHtml = await this.getSuccessHtml();
        return new Promise((resolve, reject) => {
            const server = http.createServer((req, res) => {
                if (req.url) {
                    const params = qs.parse(req.url.substring(req.url.indexOf('?') + 1));
                    if (params.code) {
                        res.writeHead(200, { 'Content-Type': "text/html" /* HTML */ });
                        res.end(successHtml);
                        req.socket.destroy();
                        server.close();
                        resolve(Array.isArray(params.code) ? params.code[0] : params.code);
                    }
                    // TODO, timeout, error handling
                }
            });
            server.listen(this.redirectPort, this.redirectHost);
        });
    }
    async exchangeAuthForAccessToken(authorizationCode, verifier) {
        const params = this.generateTokenParameters(authorizationCode, verifier);
        const { req } = await this.e.client.make('POST', this.oauthConfig.tokenUrl, this.accessTokenRequestContentType);
        const res = await req.send(params);
        if (!this.checkValidExchangeTokenRes(res)) {
            throw new errors_1.FatalException('API request was successful, but the response format was unrecognized.\n' +
                http_1.formatResponseError(req, res.status));
        }
        return res.body;
    }
    generateVerifier() {
        return this.base64URLEncode(crypto.randomBytes(32));
    }
    generateChallenge(verifier) {
        return this.base64URLEncode(crypto.createHash('sha256').update(verifier).digest());
    }
    base64URLEncode(buffer) {
        return buffer.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }
}
exports.OAuth2Flow = OAuth2Flow;
