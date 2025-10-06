import path from "path";
import { TreeItem, TreeItemCollapsibleState, Uri } from "vscode";

export class SurgeDomain extends TreeItem {
    constructor(
        public id: string,
        public hostname: string,
        public timeAgo: string,
        public readonly collapsibleState: TreeItemCollapsibleState = TreeItemCollapsibleState.None
    ) {
        super(hostname, collapsibleState);
        this.tooltip = 'Open';
        this.description = this.timeAgo;
        this.command = {
            command: 'surge-volt.open-domain',
            title: 'Open Domain',
            arguments: [hostname]
        };
    }
    
    iconPath = {
        light: Uri.file(path.join(__filename, '..', '..', 'resources', 'light', 'cloud.svg')),
        dark: Uri.file(path.join(__filename, '..', '..', 'resources', 'dark', 'cloud.svg')),
    };
}