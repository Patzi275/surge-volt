import { hello } from './commands/hello';
import { deployCommand } from './commands/deploy';
import { commands, ExtensionContext, window } from 'vscode';
import { publishedDomainTreeData } from './providers/publishedDomainProvider';
import { openDomainCommand } from './commands/openDomain';
import logger from './utils/logger';
import { deployOnExistingCommand } from './commands/deployOnExisting';
import { refreshDomainListCommand } from './commands/refreshDomainList';
import { deleteDomainCommand } from './commands/deleteDomain';
import Storage from './services/storageService';
import { exec } from 'child_process';
import { installSurgeCommand } from './commands/installSurge';
import { connectAccountCommand } from './commands/connectAccount';
import { deleteAccountCommand } from './commands/deleteAccount';
import { refreshAccountListCommand } from './commands/refreshAccountList';
import { accountListTreeData } from './providers/accountListProvider';

export function activate(context: ExtensionContext) {
	logger.info('Congratulations, your extension "surge-volt" is now active!');
	Storage.init(context);

	initContextVariables();
	context.subscriptions.push(
		// commands
		commands.registerCommand('getContext', () => context),
		hello,
		installSurgeCommand,
		deployCommand,
		deployOnExistingCommand,
		openDomainCommand,
		refreshDomainListCommand,
		deleteDomainCommand,

		connectAccountCommand,
		deleteAccountCommand,
		refreshAccountListCommand,
		
		// tree data providers
		window.registerTreeDataProvider('surge-domains', publishedDomainTreeData),
		window.registerTreeDataProvider('surge-accounts', accountListTreeData),
		
	);
}

export function deactivate() {
}

function initContextVariables() {
	commands.executeCommand('setContext', 'surge-volt:ready', false);

	exec('surge --version', (error, stdout, stderr) => {
		if (error) {
			logger.error('INIT: Surge CLI not found');
			commands.executeCommand('setContext', 'surge-volt.surge:installed', false);
		} else {
			logger.info('INIT: Surge CLI found');
			commands.executeCommand('setContext', 'surge-volt.surge:installed', true);

			exec('surge whoami', (error, stdout, stderr) => {
				if (error) {
					logger.error('INIT: Not logged in');
					commands.executeCommand('setContext', 'surge-volt.surge:connected', false);
				} else {
					logger.info('INIT: Logged in');
					commands.executeCommand('setContext', 'surge-volt.surge:connected', true);

					const accounts = Storage.getSurgeAccounts();
					if (!accounts || accounts.length === 0) {
						logger.info("INIT: No account found in storage");
						commands.executeCommand('setContext', 'surge-volt:no-account', true);
					} else {
						logger.info("INIT: Accounts found in storage");
						commands.executeCommand('setContext', 'surge-volt:no-account', false);
					}
				}
			});
		}
		commands.executeCommand('setContext', 'surge-volt:ready', true);
	});
}
