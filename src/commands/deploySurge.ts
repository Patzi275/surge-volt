import { commands, env, ProgressLocation, Uri, window, workspace } from 'vscode';
import { surgeService } from '../services/surgeService';
import { MaybeString } from '../types';
import { extractNameOnly, getWorkspaceFolder, randomDomainName } from '../utils';
import { SurgeDomain } from '../types/SurgeDomain';
import logger from '../utils/logger';
import Storage from '../services/storageService';

export const deploySurgeCommand = commands.registerCommand('surge-deploy.deploy', async (domain: SurgeDomain | undefined) => {
    logger.debug("Surge domain", domain);
    const folderPath = getWorkspaceFolder();
    let domainName: MaybeString = randomDomainName() + '.surge.sh';

    if (!folderPath) {
        logger.warn('No project folder opened');
        const action = await window.showErrorMessage("Please open the project folder before", "Open Folder");
        if (action === 'Open Folder') {
            commands.executeCommand('vscode.openFolder');
        }
        return;
    }

    const projectName = folderPath.split('/').pop();

    if (domain) {
        domainName = domain.hostname;
        // TODO: Implement "Don't show again" feature
        const action = await window.showWarningMessage(
            `You are about to deploy "${projectName}" project on surge to the existing domain "${domainName}.surge.sh"`,
            { modal: true },
            'Deploy', 'Yes, don\'t show again'
        );
        if (action !== 'Deploy') {
            return;
        }
    } else {
        domainName = await window.showInputBox({
            prompt: 'Domain',
            value: domainName,
            validateInput: (value: string) => null,
        });

        if (!domainName) { return; }
        domainName = extractNameOnly(domainName);
        if (Storage.doSurgeDomainExist(domainName)) {
            const action = await window.showWarningMessage(
                `You are about to deploy "${projectName}" project on surge to the existing domain "${domainName}.surge.sh"`,
                { modal: true },
                'Deploy', 'Yes, don\'t show again'
            );
            if (action !== 'Deploy') {
                return;
            }
        }
    }


    const done = await window.withProgress({
        location: ProgressLocation.Window,
        title: `Deploying project on surge...`,
        cancellable: true
    }, async (progress, token) => {
        token.onCancellationRequested(() => surgeService.cancel('deploying'));

        logger.info(`Deploying project ${projectName} to ${domainName}.surge.sh`);

        while (true) {
            try {
                await surgeService.deploy(folderPath, domainName);
                return true;
            } catch (error: any) {
                if (token.isCancellationRequested) { return false; }
                const action = await window.showErrorMessage('Error deploying project :', { detail: error.message }, 'Retry', 'Cancel');
                if (action !== 'Retry') { return false; }
            }
        }
    });

    if (done) {
        commands.executeCommand('surge-deploy.refresh-domain-list');
        const action = await window.showInformationMessage(`Successfully deployed "${projectName}" project on surge`, 'Open', 'Copy', 'Close');
        if (action === 'Open') {
            env.openExternal(Uri.parse(`http://${domainName}`));
        } else if (action === 'Copy') {
            env.clipboard.writeText(`http://${domainName}`);
        }
    }

});
