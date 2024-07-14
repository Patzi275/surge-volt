import { hello } from './commands/hello';
import { deploySurgeCommand } from './commands/surge';
import { ExtensionContext, window } from 'vscode';
import { publishedDomainTreeData } from './providers/publishedDomainProvider';
import { openDomainCommand } from './commands/openDomain';
import logger from './utils/logger';

export function activate(context: ExtensionContext) {
	logger.info('Congratulations, your extension "surge-deploy" is now active!');
	console.log("Loggger: ", logger);
	context.subscriptions.push(
		hello,
		deploySurgeCommand,
		openDomainCommand
	);
	window.registerTreeDataProvider('surge-default', publishedDomainTreeData);
}

export function deactivate() {}
