"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppClient = exports.formatName = void 0;
const guards_1 = require("../guards");
const color_1 = require("./color");
const http_1 = require("./http");
function formatName(app) {
    if (app.org) {
        return `${color_1.weak(`${app.org.name} / `)}${app.name}`;
    }
    return app.name;
}
exports.formatName = formatName;
class AppClient extends http_1.ResourceClient {
    constructor(token, e) {
        super();
        this.token = token;
        this.e = e;
    }
    async load(id) {
        const { req } = await this.e.client.make('GET', `/apps/${id}`);
        this.applyAuthentication(req, this.token);
        const res = await this.e.client.do(req);
        if (!guards_1.isAppResponse(res)) {
            throw http_1.createFatalAPIFormat(req, res);
        }
        return res.data;
    }
    async create(details) {
        const { req } = await this.e.client.make('POST', '/apps');
        this.applyAuthentication(req, this.token);
        req.send(details);
        const res = await this.e.client.do(req);
        if (!guards_1.isAppResponse(res)) {
            throw http_1.createFatalAPIFormat(req, res);
        }
        return res.data;
    }
    paginate(args = {}, orgId) {
        return this.e.client.paginate({
            reqgen: async () => {
                const { req } = await this.e.client.make('GET', '/apps');
                this.applyAuthentication(req, this.token);
                if (orgId) {
                    req.send({ org_id: orgId });
                }
                return { req };
            },
            guard: guards_1.isAppsResponse,
            ...args,
        });
    }
    async createAssociation(id, association) {
        const { req } = await this.e.client.make('POST', `/apps/${id}/repository`);
        req
            .set('Authorization', `Bearer ${this.token}`)
            .send({
            repository_id: association.repoId,
            type: association.type,
            branches: association.branches,
        });
        const res = await this.e.client.do(req);
        if (!guards_1.isAppAssociationResponse(res)) {
            throw http_1.createFatalAPIFormat(req, res);
        }
        return res.data;
    }
    async deleteAssociation(id) {
        const { req } = await this.e.client.make('DELETE', `/apps/${id}/repository`);
        req
            .set('Authorization', `Bearer ${this.token}`)
            .send({});
        await req;
    }
}
exports.AppClient = AppClient;
