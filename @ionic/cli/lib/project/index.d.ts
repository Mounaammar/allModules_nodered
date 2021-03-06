/// <reference types="node" />
import { BaseConfig, BaseConfigOptions, PackageJson, ParsedArgs } from '@ionic/cli-framework';
import { PromptModule } from '@ionic/cli-framework-prompts';
import { IAilmentRegistry, IClient, IConfig, IIntegration, ILogger, IMultiProjectConfig, IProject, IProjectConfig, ISession, IShell, InfoItem, IntegrationName, IonicContext, IonicEnvironmentFlags, ProjectIntegration, ProjectPersonalizationDetails, ProjectType } from '../../definitions';
import { BaseException } from '../errors';
import type { Integration as CapacitorIntegration } from '../integrations/capacitor';
import type { Integration as CordovaIntegration } from '../integrations/cordova';
import type { Integration as EnterpriseIntegration } from '../integrations/enterprise';
export interface ProjectDetailsResultBase {
    readonly type?: ProjectType;
    readonly errors: readonly ProjectDetailsError[];
}
export interface ProjectDetailsSingleAppResult extends ProjectDetailsResultBase {
    readonly context: 'app';
}
export interface ProjectDetailsMultiAppResult extends ProjectDetailsResultBase {
    readonly context: 'multiapp';
    readonly id?: string;
}
export interface ProjectDetailsUnknownResult extends ProjectDetailsResultBase {
    readonly context: 'unknown';
}
export declare type ProjectDetailsResult = (ProjectDetailsSingleAppResult | ProjectDetailsMultiAppResult | ProjectDetailsUnknownResult) & {
    readonly configPath: string;
};
export declare type ProjectDetailsErrorCode = 'ERR_INVALID_PROJECT_FILE' | 'ERR_INVALID_PROJECT_TYPE' | 'ERR_MISSING_PROJECT_TYPE' | 'ERR_MULTI_MISSING_CONFIG' | 'ERR_MULTI_MISSING_ID';
export declare class ProjectDetailsError extends BaseException {
    /**
     * Unique code for this error.
     */
    readonly code: ProjectDetailsErrorCode;
    /**
     * The underlying error that caused this error.
     */
    readonly error?: Error | undefined;
    constructor(msg: string, 
    /**
     * Unique code for this error.
     */
    code: ProjectDetailsErrorCode, 
    /**
     * The underlying error that caused this error.
     */
    error?: Error | undefined);
}
export interface ProjectDetailsDeps {
    readonly rootDirectory: string;
    readonly args?: ParsedArgs;
    readonly e: ProjectDeps;
}
export declare class ProjectDetails {
    readonly rootDirectory: string;
    protected readonly e: ProjectDeps;
    protected readonly args: ParsedArgs;
    constructor({ rootDirectory, args, e }: ProjectDetailsDeps);
    getIdFromArgs(): Promise<string | undefined>;
    getIdFromPathMatch(config: IMultiProjectConfig): Promise<string | undefined>;
    getIdFromDefaultProject(config: IMultiProjectConfig): Promise<string | undefined>;
    getTypeFromConfig(config: IProjectConfig): Promise<ProjectType | undefined>;
    getTypeFromDetection(): Promise<ProjectType | undefined>;
    protected determineSingleApp(config: IProjectConfig): Promise<ProjectDetailsSingleAppResult>;
    protected determineMultiApp(config: IMultiProjectConfig): Promise<ProjectDetailsMultiAppResult>;
    processResult(result: ProjectDetailsResult): void;
    readConfig(p: string): Promise<{
        [key: string]: any;
    }>;
    /**
     * Gather project details from specified configuration.
     *
     * This method will always resolve with a result object, with an array of
     * errors. Use `processResult()` to log warnings & errors.
     */
    result(): Promise<ProjectDetailsResult>;
}
export declare function createProjectFromDetails(details: ProjectDetailsResult, deps: ProjectDeps): Promise<IProject>;
export declare function findProjectDirectory(cwd: string): Promise<string | undefined>;
export interface CreateProjectFromDirectoryOptions {
    logErrors?: boolean;
}
export declare function createProjectFromDirectory(rootDirectory: string, args: ParsedArgs, deps: ProjectDeps, { logErrors }?: CreateProjectFromDirectoryOptions): Promise<IProject | undefined>;
export interface ProjectConfigOptions extends BaseConfigOptions {
    readonly type?: ProjectType;
}
export declare class ProjectConfig extends BaseConfig<IProjectConfig> {
    protected readonly type?: ProjectType;
    constructor(p: string, { type, ...options }?: ProjectConfigOptions);
    provideDefaults(c: Partial<Readonly<IProjectConfig>>): IProjectConfig;
}
export declare class MultiProjectConfig extends BaseConfig<IMultiProjectConfig> {
    provideDefaults(c: Partial<Readonly<IMultiProjectConfig>>): IMultiProjectConfig;
}
export interface ProjectDeps {
    readonly client: IClient;
    readonly config: IConfig;
    readonly flags: IonicEnvironmentFlags;
    readonly log: ILogger;
    readonly prompt: PromptModule;
    readonly session: ISession;
    readonly shell: IShell;
    readonly ctx: IonicContext;
}
export declare abstract class Project implements IProject {
    readonly details: ProjectDetailsResult;
    protected readonly e: ProjectDeps;
    readonly rootDirectory: string;
    abstract readonly type: ProjectType;
    protected originalConfigFile?: {
        [key: string]: any;
    };
    constructor(details: ProjectDetailsResult, e: ProjectDeps);
    get filePath(): string;
    get directory(): string;
    get pathPrefix(): string[];
    get config(): ProjectConfig;
    abstract detected(): Promise<boolean>;
    abstract requireBuildRunner(): Promise<import('../build').BuildRunner<any>>;
    abstract requireServeRunner(): Promise<import('../serve').ServeRunner<any>>;
    abstract requireGenerateRunner(): Promise<import('../generate').GenerateRunner<any>>;
    getBuildRunner(): Promise<import('../build').BuildRunner<any> | undefined>;
    getServeRunner(): Promise<import('../serve').ServeRunner<any> | undefined>;
    getGenerateRunner(): Promise<import('../generate').GenerateRunner<any> | undefined>;
    requireAppflowId(): Promise<string>;
    get packageJsonPath(): string;
    getPackageJson(pkgName?: string, { logErrors }?: {
        logErrors?: boolean;
    }): Promise<[PackageJson | undefined, string | undefined]>;
    requirePackageJson(pkgName?: string): Promise<PackageJson>;
    getDocsUrl(): Promise<string>;
    getSourceDir(): Promise<string>;
    getDefaultDistDir(): Promise<string>;
    getDistDir(): Promise<string>;
    getInfo(): Promise<InfoItem[]>;
    personalize(details: ProjectPersonalizationDetails): Promise<void>;
    setPrimaryTheme(_themeColor: string): Promise<void>;
    writeThemeColor(variablesPath: string, themeColor: string): Promise<void>;
    setAppResources(appIcon: Buffer, splash: Buffer): Promise<void>;
    registerAilments(registry: IAilmentRegistry): Promise<void>;
    createIntegration(name: 'capacitor'): Promise<CapacitorIntegration>;
    createIntegration(name: 'cordova'): Promise<CordovaIntegration>;
    createIntegration(name: 'enterprise'): Promise<EnterpriseIntegration>;
    createIntegration(name: IntegrationName): Promise<CapacitorIntegration | CordovaIntegration | EnterpriseIntegration>;
    getIntegration(name: IntegrationName): Required<ProjectIntegration> | undefined;
    requireIntegration(name: IntegrationName): Required<ProjectIntegration>;
    protected getIntegrations(): Promise<IIntegration<ProjectIntegration>[]>;
}
export declare function prettyProjectName(type?: string): string;
export declare function isValidProjectId(projectId: string): boolean;
