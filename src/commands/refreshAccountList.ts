import { commands } from "vscode";
import { accountListTreeData } from "../providers/accountListProvider";
import logger from "../utils/logger";

export const refreshAccountListCommand = commands.registerCommand('surge-volt.refresh-account-list', async () => {
    logger.info('refreshAccountListCommand: Refreshing');
    accountListTreeData.refresh();
});