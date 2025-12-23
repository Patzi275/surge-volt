import { commands, ExtensionContext } from "vscode";
import { SurgeDomain } from "../types/SurgeDomain";
import { SurgeAccount } from "../types/SurgeAccount";
import logger from "../utils/logger";
import { MaybeString } from "../types";

export default class Storage {
    private static context: ExtensionContext;

    constructor() {}

    static async init(context: ExtensionContext) {
        this.context = context;
    }

    // Domain
    static getSurgeDomains(): SurgeDomain[] {
        return this.context?.workspaceState.get<SurgeDomain[]>('surgeDomains') || [];
    }

    static async setSurgeDomains(domains: SurgeDomain[]) {
        await this.context?.workspaceState.update('surgeDomains', domains);
    }

    static doSurgeDomainExist(name: string): boolean {
        return this.getSurgeDomains().some((d) => d.hostname === name);
    }


    // Hosting folder
    static getTargetFolder(): MaybeString {
        return this.context?.workspaceState.get<string>('surge-volt:target-folder');
    }

    static async setTargetFolder(folderPath: MaybeString) {
        await this.context?.workspaceState.update('surge-volt:target-folder', folderPath);
    }


    // Account
    static getSurgeAccount(email: string): SurgeAccount | undefined {
        return this.getSurgeAccounts().find((a) => a.email === email);
    }

    static getSelectedSurgeAccount(): SurgeAccount | undefined {
        return this.getSurgeAccounts().find((a) => a.isSelected);
    }

    static async setSelectedSurgeAccount(email: string | null): Promise<boolean> {
        logger.debug("Storage: New selected account", email);
        const accounts = this.getSurgeAccounts();
        const newAccounts = accounts.map((a: SurgeAccount) => {
            a.setSelected(email !== null && a.email === email);
            return a;
        });
        await this.setSurgeAccounts(newAccounts);
        return true;
    }

    static getSurgeAccounts(): SurgeAccount[] {
        const accounts = this.context?.globalState.get<SurgeAccount[]>('surgeAccounts') || [];
        return accounts.map(account => new SurgeAccount(
            account.email,
            account.password,
            account.collapsibleState,
            account.isDefault,
            account.isSelected
        ));
    }

    static async setSurgeAccounts(accounts: SurgeAccount[]) {
        await this.context?.globalState.update('surgeAccounts', accounts);
    }

    static async addSurgeAccount(account: SurgeAccount) {
        const accounts = this.getSurgeAccounts();
        accounts.push(account);
        await this.setSurgeAccounts(accounts);
    }

    static async removeSurgeAccount(email: string) {
        const accounts = this.getSurgeAccounts();
        const newAccounts = accounts.filter((a) => a.email !== email);
        await this.setSurgeAccounts(newAccounts);
    }
}
