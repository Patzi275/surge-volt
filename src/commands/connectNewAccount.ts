import { commands, window } from "vscode";
import Storage from "../services/storageService";
import { SurgeAccount } from "../types/SurgeAccount";
import logger from "../utils/logger";

export const connectNewAccountCommand = commands.registerCommand('surge-volt.connect-new-account', async (defaultEmail?: string) => {
    logger.info('connectNewAccountCommand: Starting new account creation');
    
    let email: string | undefined;
    
    if (defaultEmail && typeof defaultEmail === 'string' && defaultEmail.includes('@')) {
        email = defaultEmail;
    } else {
        email = await window.showInputBox({
            prompt: 'New account email',
            placeHolder: 'example@surge.sh',
            validateInput: (value: string) => {
                if (!value) {
                    return 'The email is required';
                } else if (!value.includes('@')) {
                    return 'Invalid email';
                } else if (Storage.getSurgeAccount(value) !== undefined) {
                    return 'Account already exists';
                }
                return null;
            }
        });
    }
    
    if (!email) { 
        logger.info('connectNewAccountCommand: Email input cancelled');
        return; 
    }

    logger.info('connectNewAccountCommand: Email provided:', email);

    while (true) {
        const password = await window.showInputBox({
            prompt: `Password (for ${email})`,
            password: true,
            validateInput: (value: string) => {
                if (!value) {
                    return 'The password is required';
                }
                return null;
            }
        });
        
        if (!password) { 
            logger.info('connectNewAccountCommand: Password input cancelled');
            return; 
        }

        logger.info('connectNewAccountCommand: Password provided, attempting to connect');
        const newAccount = new SurgeAccount(email, password);
        const status = await commands.executeCommand('surge-volt.connect-account', newAccount, true);
        if (status !== "retry") {
            logger.info('connectNewAccountCommand: Connection completed with status:', status);
            break;
        }
    }
});