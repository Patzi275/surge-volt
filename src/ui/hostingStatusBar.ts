import path from "path";
import { ExtensionContext, StatusBarAlignment, window } from "vscode";
import Storage from "../services/storageService";
import { getWorkspaceFolder } from "../utils";

let hostingStatusBar = window.createStatusBarItem(StatusBarAlignment.Left, 100);

export const initHostingStatusBar = (context: ExtensionContext) => {
    context.subscriptions.push(hostingStatusBar);
    updateHostingFolderStatus();
    hostingStatusBar.show();
};

export const updateHostingFolderStatus = () => {
    if (!hostingStatusBar) { return; }
    const folderPath = Storage.getTargetFolder() || getWorkspaceFolder();

    if (folderPath) {
        hostingStatusBar.text = `$(folder) Hosting: ${path.basename(folderPath)}`;
        hostingStatusBar.tooltip = folderPath;
    } else {
        hostingStatusBar.text = '$(folder) Hosting: not set';
        hostingStatusBar.tooltip = 'Choose a hosting folder';
    }
    hostingStatusBar.command = 'surge-volt.choose-hosting-folder';
};
