import * as cp from 'child_process';
import { SurgeDomain } from '../types/SurgeDomain';
import logger from '../utils/logger';
import Storage from './storageService';
import { SurgeAccount } from '../types/SurgeAccount';

class SurgeService {
    private listingProcess: cp.ChildProcess | null = null;
    private deployingProcess: cp.ChildProcess | null = null;
    private teardownProcess: cp.ChildProcess | null = null;
    private authProcess: cp.ChildProcess | null = null;

    async deploy(folderPath: string, domainName: string): Promise<void> {
        const domain = domainName + '.surge.sh';
        logger.info(`Deploying ${folderPath} on ${domain}`);
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

    cancel(name: 'deploying' | 'listing' | 'teardown' | 'authentication'): void {
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
        } else if (name === 'authentication' && this.authProcess) {
            logger.info('Cancelling auth process');
            this.authProcess.kill();
            this.authProcess = null;
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
        return new Promise((resolve, reject) => {
            const surge = cp.spawn('surge', ['teardown']);
            this.teardownProcess = surge;
            surge.stdin.write(`${name}.surge.sh\n`);
            surge.stdin.end();

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

    async authenticate(email: string, password: string): Promise<SurgeAccount | null> {
        logger.info('Authenticating');
        try {
            const surge = cp.spawn('surge', ['login']);
            this.authProcess = surge;

            surge.stdin.write(`${email}\n`);
            surge.stdin.write(`${password}\n`);
            surge.stdin.end();

            let isLoggedIn = false;
            let errorOutput = '';

            surge.stdout.on('data', (data) => {
                const output = data.toString();
                // Check for successful login message
                if (output.includes('Success')) {
                    isLoggedIn = true;
                }
            });

            surge.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            await new Promise((resolve, reject) => {
                surge.on('close', (code) => {
                    this.authProcess = null;
                    if (code === 0 && isLoggedIn) {
                        logger.info('Logged in');
                        resolve(new SurgeAccount(email, password));
                    } else {
                        let errorMessage = '';
                        if (errorOutput) {
                            errorMessage = `Error logging in: ${errorOutput}`;
                        } else {
                            errorMessage = code === 0 ? 'Incorrect email or password' : `Exit code ${code}`;
                        }
                        logger.error(errorMessage);
                        reject(new Error(errorMessage));
                    }
                });
            });
        } catch (error) {
            logger.error('Unexpected error during authentication:', error);
            throw error; 
        }
        return null;
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