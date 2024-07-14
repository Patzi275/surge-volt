import { EventEmitter, TreeDataProvider, TreeItem } from "vscode";
import { surgeService } from "../services/surgeService";
import { SurgeDomain } from "../types/SurgeDomain";

class PublishedDomainProvider implements TreeDataProvider<SurgeDomain> {
    constructor() { }

    getTreeItem(element: SurgeDomain): TreeItem {
        return element;
    }

    getChildren(): Thenable<SurgeDomain[]> {
        return new Promise((resolve, reject) => {
            surgeService.list().then((data) => {
                resolve(data);
            }).catch(reject);
        });
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    private _onDidChangeTreeData: EventEmitter<SurgeDomain | undefined> = new EventEmitter<SurgeDomain | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
}

export const publishedDomainTreeData = new PublishedDomainProvider();