import { commands } from "vscode";
import { SurgeDomain } from "../types/SurgeDomain";

export const deployOnExistingCommand = commands.registerCommand('surge-volt.deploy-on-existing', async (domain: SurgeDomain | null) => {
    if (!domain) { return; }

    commands.executeCommand('surge-volt.deploy', domain);
});