import * as cp from 'child_process';
import { SurgeDomain } from '../types/SurgeDomain';
import logger from '../utils/logger';
import Storage from './storageService';

type Domain = {
    id: string,
    hostname: string,
    timeAgo: string
}

class SurgeService {
    private listingProcess: cp.ChildProcess | null = null;
    private deployingProcess: cp.ChildProcess | null = null;
    private teardownProcess: cp.ChildProcess | null = null;

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

    cancel(name : 'deploying' | 'listing' | 'teardown') {
        if (name === 'deploying' && this.deployingProcess) {
            logger.info('Cancelling deployment process');
            this.deployingProcess.kill();
            this.deployingProcess = null;
        } else if (name === 'listing' && this.listingProcess) {
            logger.info('Cancelling listing process');
            this.listingProcess.kill();
            this.listingProcess = null;
        } else if (name === 'teardown' && this.teardownProcess) {
            logger.info('Cancelling teardown process');
            this.teardownProcess.kill();
            this.teardownProcess = null;
        } else {
            logger.warn(`No ${name} process to cancel`);
        }
    }

    async list(): Promise<SurgeDomain[]> {
        logger.info('Domain list extraction');
        return new Promise((resolve, reject) => {
            this.listingProcess = cp.exec(`surge list`, (error, stdout, stderr) => {
                const elements = extractDomainData(stdout);
                Storage.setSurgeDomains(elements).then(() => resolve(elements));
            });
        });
    }

    async teardown(name: string): Promise<void> {
        logger.info(`Tearing down ${name}`);
        const surge = cp.spawn('surge', ['teardown']);
        this.teardownProcess = surge;
        surge.stdin.write(`${name}.surge.sh\n`);
        surge.stdin.end();

        return new Promise((resolve, reject) => {
            surge.on('close', (code) => {
                if (code === 0) {
                    logger.info(`Domain ${name} torn down`);
                    resolve();
                } else {
                    logger.error(`Error tearing down domain ${name}`);
                    reject(new Error(`Exit code ${code}`));
                }
                this.teardownProcess = null;
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