import { commands } from "vscode";
import { publishedDomainTreeData } from "../providers/publishedDomainProvider";

export const refreshDomainListCommand = commands.registerCommand('surge-deploy.refresh-domain-list', async () => publishedDomainTreeData.refresh());