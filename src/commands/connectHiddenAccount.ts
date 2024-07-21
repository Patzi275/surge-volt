import { commands, window } from "vscode";
import logger from "../utils/logger";
import { SurgeAccount } from "../types/SurgeAccount";
import Storage from "../services/storageService";
import { MaybeString } from "../types";

export const connectHiddenAccount = commands.registerCommand('surge-volt.connect-hidden-account', async (email: string) => {
    logger.info("connectHiddenAccount:", email);

    let password: MaybeString = '';
    const account = new SurgeAccount(email, '');

    const next = await window.showWarningMessage(`No registered surge account detected (${email}). Please, provide the password for next login.`, 'Add password');
    
    if (next) {
        while (true) {
            password = await window.showInputBox({
                prompt: `Password assword for "${email}".`,
                password: true,
                validateInput: (value: string) => null
            });


            if (!password) {
                // TODO: Implement "don't show again"
                const action = await window.showWarningMessage(
                    'You will not be able to connect to this account with this extension without having connecting it there',
                    { modal: true },
                    'Retry', 'Retry, don\'t show again'
                );
                if (!action) {
                    return;
                }
            } else {
                account.password = password;
                const accountAdded = await commands.executeCommand('surge-volt.connect-account', account, true);
                if (accountAdded) {
                    window.showInformationMessage(`Account credentials updated for ${email}`);
                    commands.executeCommand('surge-volt.refresh-domain-list');
                }
                break;
            }
        }
    }

    await Storage.addSurgeAccount(account);
    await Storage.setSelectedSurgeAccount(email);
    commands.executeCommand('surge-volt.refresh-account-list');
});
