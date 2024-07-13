import { commands, env, ProgressLocation, Uri, window, workspace } from 'vscode';
import { surgeService } from '../services/surgeService';
import { MaybeString } from '../types';
import { getWorkspaceFolder, randomDomainName } from '../utils';
import { Logger } from '../utils/logger';

export const deploySurgeCommand = commands.registerCommand('surge-deploy.deploy', async () => {
    const randomDomain = randomDomainName() + '.surge.sh';
    const folderPath = getWorkspaceFolder();

    if (!folderPath) {
        Logger.log('No project folder opened');
        const action = await window.showErrorMessage("Please open the project folder before", "Open Folder");
        if (action === 'Open Folder') {
            commands.executeCommand('vscode.openFolder');
        }
        return;
    }
    const projectName = folderPath.split('/').pop();

    let domainName: MaybeString = await window.showInputBox({
        prompt: 'Domain',
        value: randomDomain,
        // TODO: Check if the name is used by the same user
        validateInput: (value: string) => null,
    });

    if (!domainName) { return; }
    if (!domainName.endsWith('.surge.sh')) {
        domainName += '.surge.sh';
    }

    await window.withProgress({
        location: ProgressLocation.Window,
        title: `Deploying "${projectName}" project on surge`,
        cancellable: true
    }, (progress, token) => {
        token.onCancellationRequested(() => {
            surgeService.cancel();
        });

        return new Promise<void>(async (resolve, reject) => {
            let cancel = false;
            Logger.log('Deploying project...' + projectName + ' to ' + domainName);
            while (!cancel) {
                try {
                    await surgeService.deploy(folderPath, domainName);
                    cancel = true;
                    resolve();
                } catch (error: any) {
                    if (!token.isCancellationRequested) {
                        const action = await window.showErrorMessage('Error deploying project', { detail: error.message }, 'Retry', 'Cancel');
                        cancel = action !== 'Retry';
                    }
                }
            }
        });
    });

    const action = await window.showInformationMessage(`Successfully deployed "${projectName}" project on surge`, 'Open', 'Copy', 'Close');

    if (action === 'Open') {
        env.openExternal(Uri.parse(`http://${domainName}`));
    } else if (action === 'Copy') {
        env.clipboard.writeText(`http://${domainName}`);
    }
});
