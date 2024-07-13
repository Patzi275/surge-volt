import * as vscode from 'vscode';
import { Logger } from './utils/logger';
import { hello } from './commands/hello';
import { deploySurgeCommand } from './commands/surge';

export function activate(context: vscode.ExtensionContext) {

	Logger.log('Congratulations, your extension "surge-deploy" is now active!');
	context.subscriptions.push(
		hello,
		deploySurgeCommand
	);
}

export function deactivate() {}
