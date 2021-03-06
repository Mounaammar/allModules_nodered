"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IonicNamespace = void 0;
const namespace_1 = require("../lib/namespace");
class IonicNamespace extends namespace_1.Namespace {
    constructor({ env, project }) {
        super(undefined);
        this._env = env;
        this._project = project;
    }
    get project() {
        return this._project;
    }
    set project(p) {
        this._project = p;
    }
    get env() {
        return this._env;
    }
    set env(env) {
        this._env = env;
    }
    async getMetadata() {
        return {
            name: 'ionic',
            summary: '',
        };
    }
    async getNamespaces() {
        return new namespace_1.NamespaceMap([
            ['config', async () => { const { ConfigNamespace } = await Promise.resolve().then(() => require('./config/index')); return new ConfigNamespace(this); }],
            ['cordova', async () => { const { CordovaNamespace } = await Promise.resolve().then(() => require('./cordova/index')); return new CordovaNamespace(this); }],
            ['capacitor', async () => { const { CapacitorNamespace } = await Promise.resolve().then(() => require('./capacitor/index')); return new CapacitorNamespace(this); }],
            ['deploy', async () => { const { DeployNamespace } = await Promise.resolve().then(() => require('./deploy/index')); return new DeployNamespace(this); }],
            ['git', async () => { const { GitNamespace } = await Promise.resolve().then(() => require('./git/index')); return new GitNamespace(this); }],
            ['package', async () => { const { PackageNamespace } = await Promise.resolve().then(() => require('./package/index')); return new PackageNamespace(this); }],
            ['ssl', async () => { const { SSLNamespace } = await Promise.resolve().then(() => require('./ssl/index')); return new SSLNamespace(this); }],
            ['ssh', async () => { const { SSHNamespace } = await Promise.resolve().then(() => require('./ssh/index')); return new SSHNamespace(this); }],
            ['monitoring', async () => { const { MonitoringNamespace } = await Promise.resolve().then(() => require('./monitoring/index')); return new MonitoringNamespace(this); }],
            ['doctor', async () => { const { DoctorNamespace } = await Promise.resolve().then(() => require('./doctor/index')); return new DoctorNamespace(this); }],
            ['integrations', async () => { const { IntegrationsNamespace } = await Promise.resolve().then(() => require('./integrations/index')); return new IntegrationsNamespace(this); }],
            ['enterprise', async () => { const { EnterpriseNamespace } = await Promise.resolve().then(() => require('./enterprise/index')); return new EnterpriseNamespace(this); }],
            ['cap', 'capacitor'],
            ['cdv', 'cordova'],
            ['i', 'integrations'],
            ['integration', 'integrations'],
        ]);
    }
    async getCommands() {
        return new namespace_1.CommandMap([
            ['build', async () => { const { BuildCommand } = await Promise.resolve().then(() => require('./build')); return new BuildCommand(this); }],
            ['completion', async () => { const { CompletionCommand } = await Promise.resolve().then(() => require('./completion')); return new CompletionCommand(this); }],
            ['docs', async () => { const { DocsCommand } = await Promise.resolve().then(() => require('./docs')); return new DocsCommand(this); }],
            ['generate', async () => { const { GenerateCommand } = await Promise.resolve().then(() => require('./generate')); return new GenerateCommand(this); }],
            ['help', async () => { const { HelpCommand } = await Promise.resolve().then(() => require('./help')); return new HelpCommand(this); }],
            ['info', async () => { const { InfoCommand } = await Promise.resolve().then(() => require('./info')); return new InfoCommand(this); }],
            ['init', async () => { const { InitCommand } = await Promise.resolve().then(() => require('./init')); return new InitCommand(this); }],
            ['ionitron', async () => { const { IonitronCommand } = await Promise.resolve().then(() => require('./ionitron')); return new IonitronCommand(this); }],
            ['link', async () => { const { LinkCommand } = await Promise.resolve().then(() => require('./link')); return new LinkCommand(this); }],
            ['login', async () => { const { LoginCommand } = await Promise.resolve().then(() => require('./login')); return new LoginCommand(this); }],
            ['logout', async () => { const { LogoutCommand } = await Promise.resolve().then(() => require('./logout')); return new LogoutCommand(this); }],
            ['repair', async () => { const { RepairCommand } = await Promise.resolve().then(() => require('./repair')); return new RepairCommand(this); }],
            ['serve', async () => { const { ServeCommand } = await Promise.resolve().then(() => require('./serve')); return new ServeCommand(this); }],
            ['share', async () => { const { ShareCommand } = await Promise.resolve().then(() => require('./share')); return new ShareCommand(this); }],
            ['signup', async () => { const { SignupCommand } = await Promise.resolve().then(() => require('./signup')); return new SignupCommand(this); }],
            ['start', async () => { const { StartCommand } = await Promise.resolve().then(() => require('./start')); return new StartCommand(this); }],
            ['state', async () => { const { StateCommand } = await Promise.resolve().then(() => require('./state')); return new StateCommand(this); }],
            ['telemetry', async () => { const { TelemetryCommand } = await Promise.resolve().then(() => require('./telemetry')); return new TelemetryCommand(this); }],
            ['version', async () => { const { VersionCommand } = await Promise.resolve().then(() => require('./version')); return new VersionCommand(this); }],
            ['lab', async () => { const { LabCommand } = await Promise.resolve().then(() => require('./serve')); return new LabCommand(this); }],
            ['g', 'generate'],
            ['s', 'serve'],
        ]);
    }
}
exports.IonicNamespace = IonicNamespace;
