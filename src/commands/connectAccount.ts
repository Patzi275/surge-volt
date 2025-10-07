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

    // TODO: Create a proper type for the status
    const status: "done" | "failed" | "retry" = (await window.withProgress({
        location: ProgressLocation.Window,
        title: `${isNew ? 'Adding & Connecting' : 'Connecting'} account...`,
        cancellable: true
    }, async (progress, token) => {
        token.onCancellationRequested(() => surgeService.cancel('authentication'));
        try {
            const account = await surgeService.authenticate(email, password);
            if (!account) {
                throw new Error();
            }
            if (!isNew) {
                await Storage.setSelectedSurgeAccount(email);
            }
            return "done";
        } catch (err: any) {
            if (token.isCancellationRequested) { return "failed"; }
            const action = await window.showErrorMessage(`Error connection to account: ${err.message}`, { detail: err }, 'Retry', 'Cancel');
            if (action === 'Retry') { return "retry"; }
            return "failed";
        }
    })) || "failed";

    if (status === "retry") {
        return "retry";
    }

    if (status === "done") {
        if (!isNew) {
            commands.executeCommand('setContext', 'surge-volt.surge:connected', true);
        }
        commands.executeCommand('surge-volt.refresh-domain-list');
        await Storage.addSurgeAccount(new SurgeAccount(email!, password!));
        await Storage.setSelectedSurgeAccount(email!);
        window.showInformationMessage('Account logged-in/created & saved successfully.');
        commands.executeCommand('surge-volt.refresh-account-list');
    }

    return status;
});