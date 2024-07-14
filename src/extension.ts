import { hello } from './commands/hello';
import { deploySurgeCommand } from './commands/deploySurge';
import { commands, ExtensionContext, window } from 'vscode';
import { publishedDomainTreeData } from './providers/publishedDomainProvider';
import { openDomainCommand } from './commands/openDomain';
import logger from './utils/logger';
import { deployOnExistingSurgeCommand } from './commands/deployOnExistingSurge';
import { refreshDomainListCommand } from './commands/refreshDomainList';
import { deleteDomainCommand } from './commands/deleteDomain';
import Storage from './services/storageService';

export function activate(context: ExtensionContext) {
	logger.info('Congratulations, your extension "surge-deploy" is now active!');
	Storage.init(context);
	context.subscriptions.push(
		// commands
		hello,
		deploySurgeCommand,
		deployOnExistingSurgeCommand,
		openDomainCommand,
		refreshDomainListCommand,
		deleteDomainCommand,
		commands.registerCommand('getContext', () => context),

		// tree data providers
		window.registerTreeDataProvider('surge-default', publishedDomainTreeData),
		
	);
}

export function deactivate() {}
