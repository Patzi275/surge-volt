import * as assert from 'assert';
import { extractNameOnly } from '../utils';

suite('extractNameOnly', () => {
    test('returns the domain unchanged when it has no suffix or protocol', () => {
        assert.strictEqual(extractNameOnly('my-domain'), 'my-domain');
    });

    test('strips the .surge.sh suffix', () => {
        assert.strictEqual(extractNameOnly('my-domain.surge.sh'), 'my-domain');
    });

    test('strips the http:// prefix', () => {
        assert.strictEqual(extractNameOnly('http://my-domain'), 'my-domain');
    });

    test('strips both protocol and suffix together', () => {
        assert.strictEqual(extractNameOnly('http://my-domain.surge.sh'), 'my-domain');
    });

    test('does not strip an https:// prefix (current behavior)', () => {
        // extractNameOnly only replaces the literal 'http://' substring, which an
        // 'https://' URL does not contain, so the scheme survives unchanged.
        assert.strictEqual(extractNameOnly('https://my-domain.surge.sh'), 'https://my-domain');
    });
});
