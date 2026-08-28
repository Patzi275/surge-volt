import * as assert from 'assert';
import { SurgeAccount } from '../types/SurgeAccount';

suite('SurgeAccount', () => {
    test('starts unselected by default and uses the email as label', () => {
        const account = new SurgeAccount('user@example.com', 'secret');
        assert.strictEqual(account.isSelected, false);
        assert.strictEqual(account.label, 'user@example.com');
    });

    test('setSelected toggles isSelected', () => {
        const account = new SurgeAccount('user@example.com', 'secret');

        account.setSelected(true);
        assert.strictEqual(account.isSelected, true);

        account.setSelected(false);
        assert.strictEqual(account.isSelected, false);
    });

    test('registers a connect-account command bound to its email', () => {
        const account = new SurgeAccount('user@example.com', 'secret');
        assert.strictEqual(account.command?.command, 'surge-volt.connect-account');
        assert.deepStrictEqual(account.command?.arguments, ['user@example.com']);
    });
});
