import { commands, Uri, window, workspace } from "vscode";
import Storage from "../services/storageService";
import { updateHostingFolderStatus } from "../ui/hostingStatusBar";

export const chooseHostingFolderCommand = commands.registerCommand('surge-volt.choose-hosting-folder', async () => {
    const defaultTarget = Storage.getTargetFolder();
    const defaultUri = defaultTarget ? Uri.file(defaultTarget) : workspace.workspaceFolders?.[0]?.uri;

    const selection = await window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Use folder',
        defaultUri,
    });

    if (!selection || selection.length === 0) { return; }

    const selectedPath = selection[0].fsPath;
    await Storage.setTargetFolder(selectedPath);
    updateHostingFolderStatus();
    window.showInformationMessage(`Hosting folder set to ${selectedPath}`);
    return selectedPath;
});
