import * as cp from 'child_process';
import { SurgeDomain } from '../types/SurgeDomain';
import logger from '../utils/logger';

type Domain = {
    id: string,
    hostname: string,
    timeAgo: string
}

class SurgeService {
    private listingProcess: cp.ChildProcess | null = null;
    private deployingProcess: cp.ChildProcess | null = null;

    async deploy(folderPath: string, domain: string): Promise<void> {
        logger.info(`Deploying ${folderPath} on ${domain}`)
        return new Promise((resolve, reject) => {
            this.deployingProcess = cp.exec(`surge ${folderPath} ${domain}`, (err, stdout, stderr) => {
                this.deployingProcess = null;
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    cancel(): void {
        if (this.deployingProcess) {
            logger.info('Cancelling deployment process');
            this.deployingProcess.kill();
            this.deployingProcess = null;
        } else {
            logger.warn('No deployment process to cancel');
        }
    }

    async list(): Promise<SurgeDomain[]> {
        logger.info('Listing domains');
        return new Promise((resolve, reject) => {
            this.listingProcess = cp.exec(`surge list`, (error, stdout, stderr) => {
                const elements = extractDomainData(stdout);
                resolve(elements);
            });
        });
    }
}

function extractDomainData(input: string): SurgeDomain[] {
    const lines = input.trim().split('\n');

    const data = lines.map(line => {
        line = line.replace(/\x1b\[[0-9;]*m/g, '').trim();
        const els = line.split(/\s+/);
        return new SurgeDomain(
            els[0], // id
            els[1].replace('.surge.sh', ''), // hostname
            `${els[2]} ${els[3]} ${els[4]}`, //timeAgo
        );
    });

    return data;
}

export const surgeService = new SurgeService();