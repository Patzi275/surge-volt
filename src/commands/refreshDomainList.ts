import { commands } from "vscode";
import { publishedDomainTreeData } from "../providers/publishedDomainProvider";

export const refreshDomainListCommand = commands.registerCommand('surge-volt.refresh-domain-list', async () => publishedDomainTreeData.refresh());