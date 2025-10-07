import { commands, window } from "vscode";
import Storage from "../services/storageService";
import { SurgeAccount } from "../types/SurgeAccount";

export const connectNewAccountCommand = commands.registerCommand('surge-volt.connect-new-account', async (defaultEmail?: string) => {
    const email = defaultEmail || await window.showInputBox({
        prompt: 'New account email',
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

    while (true) {
        const password = await window.showInputBox({
            prompt: `Password (for ${email})`,
            password: true,
            validateInput: (value: string) => {
                if (!value) {
                    return 'The password is required';
                }
                return null;
            }
        });
        if (!password) { return; }

        const newAccount = new SurgeAccount(email, password);
        const status = await commands.executeCommand('surge-volt.connect-account', newAccount, true);
        if (status !== "retry") {
            break;
        }
    }
});