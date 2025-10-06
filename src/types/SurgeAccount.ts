import path from "path";
import { TreeItem, TreeItemCollapsibleState, Uri } from "vscode";

export class SurgeAccount extends TreeItem {
    constructor(
        public email: string,
        public password: string,
        public readonly collapsibleState: TreeItemCollapsibleState = TreeItemCollapsibleState.None,
        public isDefault: boolean = false,
        public isSelected: boolean = false
    ) {
        super(email, collapsibleState);
        this.tooltip = 'Connect';
        this.command = {
            command: 'surge-volt.connect-account',
            title: 'Connect Account',
            arguments: [email]
        };
        this.setSelected(isSelected);
    }

    public setSelected(value: boolean) {
        this.iconPath = {
            light: Uri.file(path.join(__filename, '..', '..', 'resources', 'light', value ? 'circle-filled.svg' : 'account.svg')),
            dark: Uri.file(path.join(__filename, '..', '..', 'resources', 'dark', value ? 'circle-filled.svg' : 'account.svg')),
        };
        this.isSelected = value;
    }
}