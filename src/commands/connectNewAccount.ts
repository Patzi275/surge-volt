import { commands, window } from "vscode";
import Storage from "../services/storageService";
import { SurgeAccount } from "../types/SurgeAccount";

export const connectNewAccountCommand = commands.registerCommand('surge-volt.connect-new-account', async () => {
    const email = await window.showInputBox({
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

    const password = await window.showInputBox({
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

    const newAccount = new SurgeAccount(email, password);
    const done = await commands.executeCommand('surge-volt.connect-account', newAccount, true);

    if (done) {
        newAccount.setSelected(true);
        await Storage.addSurgeAccount(newAccount);
        window.showInformationMessage('Account logged-in/created & saved successfully.');
        commands.executeCommand('surge-volt.refresh-account-list');
    }
});