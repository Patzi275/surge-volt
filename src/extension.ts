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
import { exec } from 'child_process';
import { installSurgeCommand } from './commands/installSurge';

export function activate(context: ExtensionContext) {
	logger.info('Congratulations, your extension "surge-volt" is now active!');
	initContextVariables();
	Storage.init(context);
	context.subscriptions.push(
		// commands
		hello,
		installSurgeCommand,
		deploySurgeCommand,
		deployOnExistingSurgeCommand,
		openDomainCommand,
		refreshDomainListCommand,
		deleteDomainCommand,
		commands.registerCommand('getContext', () => context),

		// tree data providers
		window.registerTreeDataProvider('surge-domains', publishedDomainTreeData),
		
	);
}

export function deactivate() {}

function initContextVariables() {
	exec('surge --version', (error, stdout, stderr) => {
		if (error) {
			logger.error('Surge CLI not found');
			commands.executeCommand('setContext', 'surgeInstalled', false);
		} else {
			logger.info('Surge CLI found');
			commands.executeCommand('setContext', 'surgeInstalled', true);

			exec('surge whoami', (error, stdout, stderr) => {
				if (error) {
					logger.error('Not logged in');
					commands.executeCommand('setContext', 'surgeLoggedIn', false);
				} else {
					logger.info('Logged in');
					commands.executeCommand('setContext', 'surgeLoggedIn', true);
				}
			});
		}
	});
}
