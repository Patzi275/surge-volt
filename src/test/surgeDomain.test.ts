import * as assert from 'assert';
import { SurgeDomain } from '../types/SurgeDomain';

suite('SurgeDomain', () => {
    test('uses the hostname as label and timeAgo as description', () => {
        const domain = new SurgeDomain('my-domain.surge.sh', 'my-domain', '2 days ago');
        assert.strictEqual(domain.label, 'my-domain');
        assert.strictEqual(domain.description, '2 days ago');
        assert.strictEqual(domain.tooltip, 'Right-click to see options');
    });
});
