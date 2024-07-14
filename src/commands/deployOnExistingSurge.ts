import { commands } from "vscode";

export const deployOnExistingSurgeCommand = commands.registerCommand('surge-deploy.deploy-on-existing', async () => {
    commands.executeCommand('surge-deploy.deploy');
});