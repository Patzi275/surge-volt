import path from "path";
import { TreeItem, TreeItemCollapsibleState } from "vscode";

export class SurgeDomain extends TreeItem {
    constructor(
        public id: string,
        public hostname: string,
        public timeAgo: string,
        public readonly collapsibleState: TreeItemCollapsibleState = TreeItemCollapsibleState.None
    ) {
        super(hostname, collapsibleState);
        // this.tooltip = this.label;
        this.description = this.timeAgo;
    }
    
    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'cloud.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'cloud.svg'),
    };
}