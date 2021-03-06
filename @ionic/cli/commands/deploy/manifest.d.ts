import { CommandMetadata } from '../../definitions';
import { DeployCoreCommand } from './core';
export declare class DeployManifestCommand extends DeployCoreCommand {
    getMetadata(): Promise<CommandMetadata>;
    run(): Promise<void>;
    private getFilesAndSizesAndHashesForGlobPattern;
    private getFileAndSizeAndHashForFile;
    private readFile;
    private getIntegrity;
    private getCapacitorConfigJsonPath;
    private getCapacitorCLIConfig;
    private getCapacitorConfig;
}
