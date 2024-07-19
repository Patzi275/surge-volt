import { commands } from "vscode";
import { accountListTreeData } from "../providers/accountListProvider";

export const refreshAccountListCommand = commands.registerCommand('surge-volt.refresh-account-list', async () => accountListTreeData.refresh());