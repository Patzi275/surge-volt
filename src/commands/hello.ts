import * as vscode from 'vscode';

export const hello = vscode.commands.registerCommand('surge-deploy.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from surge-deploy!');
});