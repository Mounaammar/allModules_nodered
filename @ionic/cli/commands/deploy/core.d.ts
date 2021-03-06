import { CommandLineOptions } from '@ionic/cli-framework';
import { Command } from '../../lib/command';
export declare abstract class DeployCoreCommand extends Command {
    protected getAppIntegration(): Promise<string | undefined>;
    protected requireNativeIntegration(): Promise<void>;
}
export declare abstract class DeployConfCommand extends DeployCoreCommand {
    protected readonly optionsToPlistKeys: {
        [key: string]: string;
    };
    protected readonly optionsToStringXmlKeys: {
        'app-id': string;
        'channel-name': string;
        'update-method': string;
        'max-store': string;
        'min-background-duration': string;
        'update-api': string;
    };
    protected readonly requiredOptionsDefaults: {
        [key: string]: string;
    };
    protected readonly requiredOptionsFromPlistVal: {
        [key: string]: string;
    };
    protected readonly requiredOptionsFromXmlVal: {
        ionic_max_versions: string;
        ionic_min_background_duration: string;
        ionic_update_api: string;
    };
    protected getAppId(): Promise<string | undefined>;
    protected checkDeployInstalled(): Promise<boolean>;
    protected printPlistInstructions(options: CommandLineOptions): void;
    protected printStringXmlInstructions(options: CommandLineOptions): void;
    protected getIosCapPlist(): Promise<string>;
    protected getAndroidCapString(): Promise<string>;
    protected addConfToIosPlist(options: CommandLineOptions): Promise<boolean>;
    protected addConfToAndroidString(options: CommandLineOptions): Promise<boolean>;
    protected preRunCheckInputs(options: CommandLineOptions): Promise<void>;
}
