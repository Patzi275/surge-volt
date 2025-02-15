import { commands, ExtensionContext, ProgressLocation, window } from "vscode";
import { surgeService } from "../services/surgeService";
import { MaybeString } from "../types";
import { extractNameOnly } from "../utils";
import { SurgeDomain } from "../types/SurgeDomain";
import Storage from "../services/storageService";

export const deleteDomainCommand = commands.registerCommand('surge-volt.delete-domain', async (domain: SurgeDomain | null) => {
    let domainName: MaybeString;

    if (!domain) {
        domainName = await window.showInputBox({
            prompt: 'Domain',
            value: '',
            validateInput: (value: string) => null,
        });
        if (!domainName) { return; }

        domainName = extractNameOnly(domainName);

        if (!Storage.doSurgeDomainExist(domainName)) {
            window.showErrorMessage('Domain not found');
            return;
        }
    } else {
        domainName = domain.hostname;
    }

    // TODO: Implement "Don't show again" feature
    const action = await window.showWarningMessage(
        `You are about to delete the domain "${domainName}.surge.sh"`,
        { modal: true },
        'Delete', 'Yes, don\'t show again'
    );

    if (action !== 'Delete') {
        return;
    }

    const done = await window.withProgress({
        location: ProgressLocation.Window,
        title: `Deleting domain...`,
        cancellable: true
    }, async (progress, token) => {
        token.onCancellationRequested(() => {
            surgeService.cancel('teardown');
        });

        while (true) {
            try {
                await surgeService.teardown(domainName);
                return true;
            } catch (error: any) {
                if (token.isCancellationRequested) {
                    return false;
                }
                const action = await window.showErrorMessage('Error while deleting domain', { detail: error.message }, 'Retry', 'Cancel');
                if (action !== 'Retry') {
                    return false;
                }
            }
        }
    });

    if (done) {
        commands.executeCommand('surge-volt.refresh-domain-list');
        window.showInformationMessage(`Domain "${domainName}.surge.sh" deleted successfully`);
    }

});