import { EventEmitter, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Command, ThemeIcon } from "vscode";

interface ResourceItem {
    label: string;
    description?: string;
    icon: string;
    command: Command;
}

class ResourcesProvider implements TreeDataProvider<TreeItem> {
    constructor() { }

    getTreeItem(element: TreeItem): TreeItem {
        return element;
    }

    getChildren(): Thenable<TreeItem[]> {
        return new Promise((resolve) => {
            const items: TreeItem[] = [
                this.createResourceItem(
                    "Give Feedback",
                    "Share your thoughts",
                    "comment",
                    "surge-volt.giveFeedback"
                ),
                this.createResourceItem(
                    "Report Issue",
                    "Found a bug?",
                    "bug",
                    "surge-volt.reportIssue"
                ),
                this.createResourceItem(
                    "Star on GitHub",
                    "Show your support",
                    "star",
                    "surge-volt.starRepo"
                ),
                this.createResourceItem(
                    "View Documentation",
                    "Learn more",
                    "book",
                    "surge-volt.viewDocs"
                ),
            ];
            resolve(items);
        });
    }

    private createResourceItem(label: string, description: string, icon: string, commandId: string): TreeItem {
        const item = new TreeItem(label, TreeItemCollapsibleState.None);
        item.description = description;
        item.iconPath = new ThemeIcon(icon);
        item.command = {
            command: commandId,
            title: label,
        };
        return item;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    private _onDidChangeTreeData: any = new EventEmitter<TreeItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
}

export const resourcesTreeData = new ResourcesProvider();
