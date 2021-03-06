import { CommandLineInputs, CommandLineOptions, CommandMetadata, CommandPreRun } from '../definitions';
import { Command } from '../lib/command';
export declare class LoginCommand extends Command implements CommandPreRun {
    getMetadata(): Promise<CommandMetadata>;
    preRun(inputs: CommandLineInputs, options: CommandLineOptions): Promise<void>;
    getPasswordFromStdin(): Promise<string>;
    run(inputs: CommandLineInputs, options: CommandLineOptions): Promise<void>;
    logout(): Promise<void>;
}
