import { adjectives, animals, colors, Config, uniqueNamesGenerator } from "unique-names-generator";
import { workspace } from "vscode";
import { MaybeString } from "../types";

export const randomDomainName = () => {
    const config: Config = {
        dictionaries: [adjectives, colors, animals],
        separator: '-',
        seed: Math.floor(Math.random() * 1000)
    };
    return uniqueNamesGenerator(config);
};

export const getWorkspaceFolder = () : MaybeString => {
    if (workspace.workspaceFolders === undefined){
        return undefined;
    }
    return workspace.workspaceFolders[0].uri.path;
};

export const extractNameOnly = (domain: string) => {
    let domainName = domain;
    if (domainName.endsWith('.surge.sh')) {
        domainName = domainName.replace('.surge.sh', '');
    }
    if (domainName.startsWith('http://') || domainName.startsWith('https://'))  {
        domainName = domainName.replace('http://', '');
    }
    return domainName;
};