import { commands, ExtensionContext } from "vscode";
import { SurgeDomain } from "../types/SurgeDomain";
import logger from "../utils/logger";

export default class Storage {
    private static context: ExtensionContext;

    constructor() {}

    static async init(context: ExtensionContext) {
        this.context = context;
    }

    static getSurgeDomains(): SurgeDomain[] {
        return this.context?.workspaceState.get<SurgeDomain[]>('surgeDomains') || [];
    }

    static async setSurgeDomains(domains: SurgeDomain[]) {
        await this.context?.workspaceState.update('surgeDomains', domains);
    }

    static doSurgeDomainExist(name: string): boolean {
        return this.getSurgeDomains().some((d) => d.hostname === name);
    }
}
