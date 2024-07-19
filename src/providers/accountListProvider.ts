import { EventEmitter, TreeDataProvider } from "vscode";
import { SurgeAccount } from "../types/SurgeAccount";
import Storage from "../services/storageService";

class AccountListProvider implements TreeDataProvider<SurgeAccount> {
    constructor() { }

    getTreeItem(element: SurgeAccount): SurgeAccount {
        return element;
    }

    getChildren(): Thenable<SurgeAccount[]> {
        return new Promise((resolve, reject) => {
            resolve(Storage.getSurgeAccounts());
        });
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    private _onDidChangeTreeData: any = new EventEmitter<SurgeAccount | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
}

export const accountListTreeData = new AccountListProvider();