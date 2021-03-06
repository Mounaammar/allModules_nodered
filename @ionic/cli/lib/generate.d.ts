import { PromptModule } from '@ionic/cli-framework-prompts';
import { CommandLineInputs, CommandLineOptions, CommandMetadata, GenerateOptions, IConfig, ILogger, IProject, IShell, IonicContext, Runner } from '../definitions';
export interface GenerateRunnerDeps {
    readonly config: IConfig;
    readonly ctx: IonicContext;
    readonly log: ILogger;
    readonly project: IProject;
    readonly prompt: PromptModule;
    readonly shell: IShell;
}
export declare abstract class GenerateRunner<T extends GenerateOptions> implements Runner<T, void> {
    protected abstract readonly e: GenerateRunnerDeps;
    createOptionsFromCommandLine(inputs: CommandLineInputs, options: CommandLineOptions): GenerateOptions;
    ensureCommandLine(inputs: CommandLineInputs, options: CommandLineOptions): Promise<void>;
    abstract getCommandMetadata(): Promise<Partial<CommandMetadata>>;
    abstract run(options: T): Promise<void>;
}
