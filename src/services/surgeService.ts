import * as cp from 'child_process';
import { Logger } from '../utils/logger';

class SurgeService {
    private currentProcess: cp.ChildProcess | null = null;

    async deploy(folderPath: string, domain: string) : Promise<void> {
        Logger.log(`Deploying ${folderPath} on ${domain}`)
        return new Promise((resolve, reject) => {
            this.currentProcess = cp.exec(`surge ${folderPath} ${domain}`, (err, stdout, stderr) => {
                this.currentProcess = null;
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    cancel(): void {
        if (this.currentProcess) {
            Logger.log('Cancelling deployment process');
            this.currentProcess.kill();
            this.currentProcess = null;
        } else {
            Logger.error('No deployment process to cancel');
        }
    }
}

export const surgeService = new SurgeService();