import { commands } from "vscode";
import { SurgeDomain } from "../types/SurgeDomain";

export const deployOnExistingSurgeCommand = commands.registerCommand('surge-deploy.deploy-on-existing', async (domain: SurgeDomain | null) => {
    if (!domain) { return; }

    commands.executeCommand('surge-deploy.deploy', domain);
});