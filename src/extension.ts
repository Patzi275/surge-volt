import { hello } from './commands/hello';
import { deploySurgeCommand } from './commands/deploySurge';
import { ExtensionContext, window } from 'vscode';
import { publishedDomainTreeData } from './providers/publishedDomainProvider';
import { openDomainCommand } from './commands/openDomain';
import logger from './utils/logger';
import { deployOnExistingSurgeCommand } from './commands/deployOnExistingSurge';
import { refreshDomainListCommand } from './commands/refreshDomainList';

export function activate(context: ExtensionContext) {
	logger.info('Congratulations, your extension "surge-deploy" is now active!');
	context.subscriptions.push(
		// commands
		hello,
		deploySurgeCommand,
		deployOnExistingSurgeCommand,
		openDomainCommand,
		refreshDomainListCommand,

		// tree data providers
		window.registerTreeDataProvider('surge-default', publishedDomainTreeData),
		
	);
}

export function deactivate() {}
