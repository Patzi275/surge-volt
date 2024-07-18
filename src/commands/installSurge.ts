import { commands, window } from "vscode";

export const installSurgeCommand = commands.registerCommand('surge-deploy.install', () => {
    const terminal = window.createTerminal('Install Surge');
    terminal.show();
    terminal.sendText('npm install -g surge');
});