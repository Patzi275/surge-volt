import { Logger } from './utils/logger';
import { hello } from './commands/hello';
import { deploySurgeCommand } from './commands/surge';
import { ExtensionContext, window } from 'vscode';
import { publishedDomainTreeData } from './providers/publishedDomainProvider';
import { openDomainCommand } from './commands/openDomain';

export function activate(context: ExtensionContext) {

	Logger.log('Congratulations, your extension "surge-deploy" is now active!');
	context.subscriptions.push(
		hello,
		deploySurgeCommand,
		openDomainCommand
	);
	window.registerTreeDataProvider('surge-default', publishedDomainTreeData);
}

export function deactivate() {}
