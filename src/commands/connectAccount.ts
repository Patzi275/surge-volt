import { commands, ProgressLocation, window } from "vscode";
import { SurgeAccount } from "../types/SurgeAccount";
import Storage from "../services/storageService";
import { MaybeString } from "../types";
import { surgeService } from "../services/surgeService";
import logger from "../utils/logger";

export const connectAccountCommand = commands.registerCommand('surge-volt.connect-account', async (param: SurgeAccount | undefined) => {
    logger.info('Connect account');

    let isNew = false;
    let email: MaybeString;
    let password: MaybeString;


    if (!param) {
        email = await window.showInputBox({
            prompt: 'Email',
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

        password = await window.showInputBox({
            prompt: 'Password',
            password: true,
            validateInput: (value: string) => {
                if (!value) {
                    return 'The password is required';
                }
                return null;
            }
        });
        if (!password) { return; }
        isNew = true;
    } else {
        email = param.email;
        password = param.password;
    }


    logger.debug('Email', email, '\nPassword', password);

    const done = await window.withProgress({
        location: ProgressLocation.Window,
        title: 'Adding account...',
        cancellable: true
    }, async (progress, token) => {
        token.onCancellationRequested(() => surgeService.cancel('authentication'));

        while (true) {
            try {
                const account = await surgeService.authenticate(email, password);
                if (!account) {
                    throw new Error();
                }
                if (isNew) {
                    await Storage.addSurgeAccount(account);
                }
                await Storage.setSelectedSurgeAccount(email);
                return true;
            } catch (error: any) {
                if (token.isCancellationRequested) { return false; }
                const action = await window.showErrorMessage(`Error adding account: ${error.message}`, { detail: error }, 'Retry', 'Cancel');
                if (action !== 'Retry') { return false; }
            }
        }
    });

    if (done) {
        if (isNew) {
            window.showInformationMessage('Account logged in or created successfully.');
        }
        commands.executeCommand('surge-volt.refresh-account-list');
        commands.executeCommand('surge-volt.refresh-domain-list');
    }
});