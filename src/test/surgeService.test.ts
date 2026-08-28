import * as assert from 'assert';
import { extractEmail, extractDomainData } from '../services/surgeService';

suite('surgeService output parsing', () => {
    suite('extractEmail', () => {
        test('returns null when the CLI reports not authenticated', () => {
            assert.strictEqual(extractEmail('Not Authenticated'), null);
        });

        test('returns null for empty output', () => {
            assert.strictEqual(extractEmail('   '), null);
        });

        test('extracts the email from whoami output', () => {
            assert.strictEqual(extractEmail('user@example.com'), 'user@example.com');
        });

        test('strips ANSI color codes before parsing', () => {
            assert.strictEqual(extractEmail('\x1b[32muser@example.com\x1b[0m'), 'user@example.com');
        });
    });

    suite('extractDomainData', () => {
        test('returns an empty array when the account has no domains', () => {
            assert.deepStrictEqual(extractDomainData('Empty'), []);
        });

        test('parses a single domain line', () => {
            const [domain] = extractDomainData('my-domain.surge.sh 2 days ago');
            assert.strictEqual(domain.id, 'my-domain.surge.sh');
            assert.strictEqual(domain.hostname, 'my-domain');
            assert.strictEqual(domain.timeAgo, '2 days ago');
        });

        test('parses multiple domain lines', () => {
            const input = 'foo.surge.sh 2 days ago\nbar.surge.sh 5 hours ago';
            const domains = extractDomainData(input);
            assert.strictEqual(domains.length, 2);
            assert.strictEqual(domains[0].hostname, 'foo');
            assert.strictEqual(domains[1].hostname, 'bar');
        });

        test('blanks out the trailing token when it is "surge"', () => {
            const [domain] = extractDomainData('my-domain.surge.sh 2 days surge');
            assert.strictEqual(domain.timeAgo, '2 days ');
        });
    });
});
