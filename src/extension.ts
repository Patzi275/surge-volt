import * as vscode from 'vscode';
import { Logger } from './utils/logger';
import { hello } from './commands/hello';

export function activate(context: vscode.ExtensionContext) {

	Logger.log('Congratulations, your extension "surge-deploy" is now active!');
	context.subscriptions.push(hello);
}

export function deactivate() {}
