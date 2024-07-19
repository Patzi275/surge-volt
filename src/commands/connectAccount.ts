import { commands, ProgressLocation, window } from "vscode";
import { SurgeAccount } from "../types/SurgeAccount";
import Storage from "../services/storageService";
import { MaybeString } from "../types";
import { surgeService } from "../services/surgeService";
import logger from "../utils/logger";

export const connectAccountCommand = commands.registerCommand('surge-volt.connect-account', async (param: string | SurgeAccount, isNew: boolean = false) => {
    logger.info('connectAccountCommand:', param);

    let email: MaybeString;
    let password: MaybeString;


    if (typeof param === 'string') {
        email = param;
        password = Storage.getSurgeAccount(email)!.password;   
    } else {
        email = param.email;
        password = param.password;
    }

    const done = await window.withProgress({
        location: ProgressLocation.Window,
        title: `${isNew ? 'adding & ' : ''}connecting account...`,
        cancellable: true
    }, async (progress, token) => {
        token.onCancellationRequested(() => surgeService.cancel('authentication'));

        while (true) {
            try {
                const account = await surgeService.authenticate(email, password);
                if (!account) {
                    throw new Error();
                }
                if (!isNew) {
                    await Storage.setSelectedSurgeAccount(email);
                }
                return true;
            } catch (error: any) {
                if (token.isCancellationRequested) { return false; }
                const action = await window.showErrorMessage(`Error connection to account: ${error.message}`, { detail: error }, 'Retry', 'Cancel');
                if (action !== 'Retry') { return false; }
            }
        }
    });

    if (done) {
        if (!isNew) {
            commands.executeCommand('surge-volt.refresh-account-list');
            commands.executeCommand('surge-volt.refresh-domain-list');
            commands.executeCommand('setContext', 'surge-volt.surge:connected', true);
        }
        return true;
    }

    return false;
});