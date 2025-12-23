import { QuickInputButton, ThemeIcon, window } from "vscode";

const submitDomainButton: QuickInputButton = {
    iconPath: new ThemeIcon('check'),
    tooltip: 'Use this domain'
};

export async function promptForDomain(defaultValue?: string, title: string = 'Surge Domain'): Promise<string | undefined> {
    return await new Promise(resolve => {
        const input = window.createInputBox();
        input.title = title;
        input.prompt = 'Enter the domain to deploy to';
        input.placeholder = 'your-domain.surge.sh';
        if (defaultValue) {
            input.value = defaultValue;
        }
        input.buttons = [submitDomainButton];

        const accept = () => {
            const value = input.value.trim();
            if (!value) {
                input.validationMessage = 'Domain is required';
                return;
            }
            input.validationMessage = undefined;
            input.hide();
            resolve(value);
        };

        input.onDidAccept(accept);
        input.onDidTriggerButton(accept);
        input.onDidHide(() => resolve(undefined));
        input.show();
    });
}
