"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomServeRunner = void 0;
const utils_network_1 = require("@ionic/utils-network");
const color_1 = require("../../color");
const errors_1 = require("../../errors");
const serve_1 = require("../../serve");
class CustomServeRunner extends serve_1.ServeRunner {
    constructor(e) {
        super();
        this.e = e;
    }
    async getCommandMetadata() {
        return {};
    }
    modifyOpenUrl(url, options) {
        return url;
    }
    async serveProject(options) {
        const cli = this.getPkgManagerServeCLI();
        if (!await cli.resolveScript()) {
            throw new errors_1.RunnerException(`Cannot perform serve.\n` +
                `Since you're using the ${color_1.strong('custom')} project type, you must provide the ${color_1.input(cli.script)} npm script so the Ionic CLI can serve your project.`);
        }
        const [externalIP, availableInterfaces] = await this.selectExternalIP(options);
        const port = options.port = await utils_network_1.findClosestOpenPort(options.port);
        await cli.serve(options);
        return {
            custom: true,
            protocol: 'http',
            localAddress: 'localhost',
            externalAddress: externalIP,
            externalNetworkInterfaces: availableInterfaces,
            port,
            externallyAccessible: ![serve_1.BIND_ALL_ADDRESS, ...serve_1.LOCAL_ADDRESSES].includes(externalIP),
        };
    }
}
exports.CustomServeRunner = CustomServeRunner;
