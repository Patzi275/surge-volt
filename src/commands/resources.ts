import { commands, env, Uri } from 'vscode';

const REPO_URL = 'https://github.com/Patzi275/surge-volt';

export const giveFeedbackCommand = commands.registerCommand('surge-volt.giveFeedback', async () => {
    const feedbackUrl = `${REPO_URL}/discussions/new?category=general`;
    env.openExternal(Uri.parse(feedbackUrl));
});

export const reportIssueCommand = commands.registerCommand('surge-volt.reportIssue', async () => {
    const issueUrl = `${REPO_URL}/issues/new`;
    env.openExternal(Uri.parse(issueUrl));
});

export const starRepoCommand = commands.registerCommand('surge-volt.starRepo', async () => {
    env.openExternal(Uri.parse(REPO_URL));
});

export const viewDocsCommand = commands.registerCommand('surge-volt.viewDocs', async () => {
    const docsUrl = `${REPO_URL}#readme`;
    env.openExternal(Uri.parse(docsUrl));
});
