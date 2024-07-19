import { commands, ProgressLocation, window } from "vscode";
import { SurgeAccount } from "../types/SurgeAccount";
import { surgeService } from "../services/surgeService";
import Storage from "../services/storageService";

export const disconnectAccountCommand = commands.registerCommand('surge-volt.disconnect-account', async (showMessage: boolean = true) => {
    await window.withProgress({
        location: ProgressLocation.Window,
        title: 'Logging out...',
        cancellable: false
    }, async () => {
        surgeService.logout();
        Storage.setSelectedSurgeAccount(null);
        commands.executeCommand('surge-volt.refresh-account-list');
        commands.executeCommand('surge-volt.refresh-domain-list');
        commands.executeCommand('setContext', 'surge-volt.surge:connected', false);
    });
    if (showMessage) {
        window.showInformationMessage('Logged out successfully.');
    }
});