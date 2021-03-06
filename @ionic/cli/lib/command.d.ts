import { BaseCommand } from '@ionic/cli-framework';
import { TaskChain } from '@ionic/cli-framework-output';
import { CommandInstanceInfo, CommandLineInputs, CommandLineOptions, CommandMetadata, CommandMetadataInput, CommandMetadataOption, ICommand, INamespace, IProject, IonicEnvironment } from '../definitions';
export declare abstract class Command extends BaseCommand<ICommand, INamespace, CommandMetadata, CommandMetadataInput, CommandMetadataOption> implements ICommand {
    namespace: INamespace;
    protected readonly taskChains: TaskChain[];
    constructor(namespace: INamespace);
    get env(): IonicEnvironment;
    get project(): IProject | undefined;
    createTaskChain(): TaskChain;
    execute(inputs: CommandLineInputs, options: CommandLineOptions, runinfo: CommandInstanceInfo): Promise<void>;
    getCleanInputsForTelemetry(inputs: CommandLineInputs, options: CommandLineOptions): Promise<string[]>;
}
