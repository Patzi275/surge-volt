import { commands, ProgressLocation, window } from "vscode";
import { SurgeAccount } from "../types/SurgeAccount";
import { MaybeString } from "../types";
import Storage from "../services/storageService";

export const deleteAccountCommand = commands.registerCommand('surge-volt.delete-account', async (param: SurgeAccount | null) => {
    let email: MaybeString;
    if (!param) {
        email = await window.showInputBox({
            prompt: 'Email',
            value: '',
            validateInput: (value: string) => {
                if (!value) {
                    return 'The email is required';
                } else if (!value.includes('@')) {
                    return 'Invalid email';
                } else if (Storage.getSurgeAccount(value) !== undefined) {
                    return 'Account already exists';
                }
                return null;
            }
        });
        if (!email) { return; }

    } else {
        email = param.email;
    }

    const action = await window.showWarningMessage(
        `You are about to delete the account "${email}"`,
        { modal: true },
        'Delete', 'Yes, don\'t show again'
    );

    if (action !== 'Delete') {
        return;
    }

     const done = await window.withProgress({
        location: ProgressLocation.Window,
        title: `Deleting account...`,
        cancellable: true
    }, async (progress, token) => {
        while (true) {
            try {
                await Storage.removeSurgeAccount(email);
                return true;
            } catch (error: any) {
                if (token.isCancellationRequested) {
                    return false;
                }
                const action = await window.showErrorMessage('Error while deleting account', { detail: error.message }, 'Retry', 'Cancel');
                if (action !== 'Retry') {
                    return false;
                }
            }
        }
    });

    if (done) {
        commands.executeCommand('surge-volt.refresh-account-list');
        window.showInformationMessage(`Account "${email}" deleted successfully`);
    }
});