"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenIDFlow = void 0;
const guards_1 = require("../../guards");
const oauth_1 = require("./oauth");
class OpenIDFlow extends oauth_1.OAuth2Flow {
    constructor({ accessTokenRequestContentType = "application/x-www-form-urlencoded" /* FORM_URLENCODED */, ...options }, e) {
        super({ accessTokenRequestContentType, ...options }, e);
        this.e = e;
        this.flowName = 'open_id';
    }
    generateAuthorizationParameters(challenge) {
        return {
            audience: this.oauthConfig.apiAudience,
            scope: 'openid profile email offline_access',
            response_type: 'code',
            client_id: this.oauthConfig.clientId,
            code_challenge: challenge,
            code_challenge_method: 'S256',
            redirect_uri: this.redirectUrl,
            nonce: this.generateVerifier(),
        };
    }
    generateTokenParameters(code, verifier) {
        return {
            grant_type: 'authorization_code',
            client_id: this.oauthConfig.clientId,
            code_verifier: verifier,
            code,
            redirect_uri: this.redirectUrl,
        };
    }
    generateRefreshTokenParameters(refreshToken) {
        return {
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
            client_id: this.oauthConfig.clientId,
        };
    }
    checkValidExchangeTokenRes(res) {
        return guards_1.isOpenIDTokenExchangeResponse(res);
    }
    getAuthConfig() {
        return this.e.config.getOpenIDOAuthConfig();
    }
}
exports.OpenIDFlow = OpenIDFlow;
