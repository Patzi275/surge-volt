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
            logger.info('SurgeService: Cancelling deployment process');
            this.deployingProcess.kill();
            this.deployingProcess = null;
        } else if (name === 'listing' && this.listingProcess) {
            logger.info('SurgeService: Cancelling listing process');
            this.listingProcess.kill();
            this.listingProcess = null;
        } else if (name === 'teardown' && this.teardownProcess) {
            logger.info('SurgeService: Cancelling teardown process');
            this.teardownProcess.kill();
            this.teardownProcess = null;
        } else if (name === 'authentication' && this.authProcess) {
            logger.info('SurgeService: Cancelling auth process');
            this.authProcess.kill();
            this.authProcess = null;
        } else {
            logger.warn(`SurgeService: No ${name} process to cancel`);
        }
    }

    async list(): Promise<SurgeDomain[]> {
        logger.info('SurgeService: Domain list extraction');

        const isAuthenticated = await this.whoami();
        if (!isAuthenticated) {
            logger.info('SurgeService: User not authenticated, returning empty array');
            return [];
        }

        return new Promise((resolve, reject) => {
            this.listingProcess = cp.exec('surge list', (error, stdout, stderr) => {
                if (error) {
                    logger.error('SurgeService: Failed to list domains', error);
                    return reject(error);
                }

                const elements = extractDomainData(stdout);
                logger.info('SurgeService: Extracted domains - ' + elements.length);
                Storage.setSurgeDomains(elements).then(() => resolve(elements));
            });
        });
    }

    async teardown(name: string): Promise<void> {
        logger.info(`SurgeService: Tearing down ${name}`);
        return new Promise((resolve, reject) => {
            const surge = cp.spawn('surge', ['teardown']);
            this.teardownProcess = surge;
            surge.stdin.write(`${name}.surge.sh\n`);
            surge.stdin.end();

            surge.on('close', (code) => {
                if (code === 0) {
                    logger.info(`SurgeService: Domain ${name} torn down`);
                    resolve();
                } else {
                    logger.error(`SurgeService: Error tearing down domain ${name}`);
                    reject(new Error(`Exit code ${code}`));
                }
                this.teardownProcess = null;
            });
        });
    }

    async authenticate(email: string, password: string): Promise<SurgeAccount | null> {
        return new Promise((resolve, reject) => {
            const surge = cp.spawn('surge', ['login']);
            this.authProcess = surge;
            let passwordTry = 0;
            let output = '';
            logger.debug(`SurgeService: Authenticating ${email} ${password}; Process ID: ${surge.pid}`);

            surge.stdout.on('data', (data) => {
                const dataStr = data.toString();
                output += dataStr;

                if (dataStr.includes('email:')) {
                    surge.stdin.write(`${email}\n`);
                    logger.info('SurgeService: Email written');
                } else if (dataStr.includes('password:')) {
                    passwordTry++;
                    logger.info('SurgeService: Password try', passwordTry);
                    if (passwordTry > 1) {
                        logger.error('SurgeService: [FAIL] Password try limit reached');
                        surge.stdin.end();
                        this.authProcess = null;
                        reject(new Error("Invalid email or password"));
                    } else {
                        surge.stdin.write(`${password}\n`);
                        logger.info(`SurgeService: Password written for the ${passwordTry} time`);
                    }
                } else if (dataStr.includes('Success')) {
                    logger.info("SurgeService: Login success");
                    surge.stdin.end();
                    this.authProcess = null;
                    resolve(new SurgeAccount(email, password));
                }
            });

            surge.stderr.on('data', (data) => {
                output += data.toString();
            });

            surge.on('close', (code) => {
                if (code !== 0 && !output.includes('Success')) {
                    this.authProcess = null;
                    reject(new Error(`Login failed with output: ${output}`));
                }
            });

            surge.on('error', (error) => {
                this.authProcess = null;
                reject(new Error('Proccess error: ' + error.message));
            });
        });
    }

    async whoami(): Promise<string | null> {
        return new Promise((resolve, reject) => {
            const process = cp.exec('surge whoami', (error, stdout, stderr) => {
                if (error) {
                    logger.error('SurgeService: whoami command failed', error);
                    return reject(error.message);
                }

                const email = extractEmail(stdout);
                resolve(email);
            });

            process.on('error', (error) => {
                logger.error('SurgeService: whoami command failed', error);
                reject(error.message);
            });
        });
    }

    async logout(): Promise<void> {
        return new Promise((resolve, reject) => {
            const surge = cp.spawn('surge', ['logout']);
            surge.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Exit code ${code}`));
                }
            });
        });
    }
}

function extractEmail(input: string): string | null {
    input = input.replace(/\x1b\[[0-9;]*m/g, '').trim();
    if (input === '' || input.includes('Not Authenticated')) {
        return null;
    }
    const email = input.split(' ')[0];
    return email;
}

function extractDomainData(input: string): SurgeDomain[] {
    if (input.includes('Empty')) {
        return [];
    }

    const lines = input.trim().split('\n');

    const data = lines.map(line => {
        line = line.replace(/\x1b\[[0-9;]*m/g, '').trim();
        const els = line.split(/\s+/);
        return new SurgeDomain(
            els[0], // id
            els[0].replace('.surge.sh', ''), // hostname
            `${els[2]} ${els[3]} ${els[4]}`, //timeAgo
        );
    });

    return data;
}

export const surgeService = new SurgeService();