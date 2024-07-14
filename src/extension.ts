import { hello } from './commands/hello';
import { deploySurgeCommand } from './commands/deploySurge';
import { ExtensionContext, window } from 'vscode';
import { publishedDomainTreeData } from './providers/publishedDomainProvider';
import { openDomainCommand } from './commands/openDomain';
import logger from './utils/logger';
import { deployOnExistingSurgeCommand } from './commands/deployOnExistingSurge';

export function activate(context: ExtensionContext) {
	logger.info('Congratulations, your extension "surge-deploy" is now active!');
	context.subscriptions.push(
		hello,
		deploySurgeCommand,
		deployOnExistingSurgeCommand,
		openDomainCommand
	);
	window.registerTreeDataProvider('surge-default', publishedDomainTreeData);
}

export function deactivate() {}
