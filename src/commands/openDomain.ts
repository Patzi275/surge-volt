import { commands, env, Uri, window } from "vscode";
import { SurgeDomain } from "../types/SurgeDomain";
import { MaybeString } from "../types";
import { Logger } from "../utils/logger";

export const openDomainCommand = commands.registerCommand('surge-deploy.open-domain', async (hostname: string | undefined) => {
    let url = null;
    if (hostname) {
        url = `https://${hostname}.surge.sh`;
    } else {
        let input: MaybeString = await window.showInputBox({
            prompt: 'Domain'
        });
        if (!input) { return; }
        if (!(input.startsWith('http://') || input.startsWith('https://'))) {
            input = `https://${input}`;
        }
        if (!input.endsWith('.surge.sh')) {
            input += '.surge.sh';
        }
        url = input;
    }

    Logger.log('Opening domain: ' + url);
    await env.openExternal(Uri.parse(url));
});