import { TreeDataProvider, TreeItem } from "vscode";
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
}

export const publishedDomainTreeData = new PublishedDomainProvider();