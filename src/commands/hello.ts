import * as vscode from 'vscode';
import { surgeService } from '../services/surgeService';

export const hello = vscode.commands.registerCommand('surge-volt.hello', async () => {
    await surgeService.list();
    vscode.window.showInformationMessage('Listed!');
});