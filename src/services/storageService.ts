import { commands, ExtensionContext } from "vscode";
import { SurgeDomain } from "../types/SurgeDomain";
import logger from "../utils/logger";
import { SurgeAccount } from "../types/SurgeAccount";

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


    // Account
    static getSurgeAccount(email: string): SurgeAccount | undefined {
        return this.getSurgeAccounts().find((a) => a.email === email);
    }

    static getSelectedSurgeAccount(): SurgeAccount | undefined {
        return this.getSurgeAccounts().find((a) => a.isSelected);
    }

    static async setSelectedSurgeAccount(email: string): Promise<boolean> {
        const accounts = this.getSurgeAccounts();
        const newAccounts = accounts.map((a) => {
            a.isSelected = a.email === email;
            return a;
        });
        await this.setSurgeAccounts(newAccounts);
        return true;
    }

    static getSurgeAccounts(): SurgeAccount[] {
        return this.context?.globalState.get<SurgeAccount[]>('surgeAccounts') || [];
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
