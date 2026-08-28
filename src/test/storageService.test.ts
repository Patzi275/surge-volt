import * as assert from 'assert';
import Storage from '../services/storageService';
import { SurgeAccount } from '../types/SurgeAccount';
import { SurgeDomain } from '../types/SurgeDomain';

class FakeMemento {
    private store = new Map<string, unknown>();

    get<T>(key: string, defaultValue?: T): T {
        return (this.store.has(key) ? this.store.get(key) : defaultValue) as T;
    }

    update(key: string, value: unknown): Thenable<void> {
        this.store.set(key, value);
        return Promise.resolve();
    }
}

function createFakeContext(): any {
    return {
        workspaceState: new FakeMemento(),
        globalState: new FakeMemento(),
    };
}

suite('Storage', () => {
    setup(async () => {
        await Storage.init(createFakeContext());
    });

    test('getSurgeDomains defaults to an empty array', () => {
        assert.deepStrictEqual(Storage.getSurgeDomains(), []);
    });

    test('setSurgeDomains persists domains and doSurgeDomainExist finds them by hostname', async () => {
        await Storage.setSurgeDomains([new SurgeDomain('foo.surge.sh', 'foo', 'just now')]);

        assert.strictEqual(Storage.doSurgeDomainExist('foo'), true);
        assert.strictEqual(Storage.doSurgeDomainExist('bar'), false);
    });

    test('addSurgeAccount adds new accounts and updates existing ones by email', async () => {
        await Storage.addSurgeAccount(new SurgeAccount('a@example.com', 'pw1'));
        await Storage.addSurgeAccount(new SurgeAccount('b@example.com', 'pw2'));
        await Storage.addSurgeAccount(new SurgeAccount('a@example.com', 'pw1-updated'));

        const accounts = Storage.getSurgeAccounts();
        assert.strictEqual(accounts.length, 2);
        assert.strictEqual(Storage.getSurgeAccount('a@example.com')?.password, 'pw1-updated');
    });

    test('removeSurgeAccount removes only the matching account', async () => {
        await Storage.addSurgeAccount(new SurgeAccount('a@example.com', 'pw1'));
        await Storage.addSurgeAccount(new SurgeAccount('b@example.com', 'pw2'));

        await Storage.removeSurgeAccount('a@example.com');

        const accounts = Storage.getSurgeAccounts();
        assert.strictEqual(accounts.length, 1);
        assert.strictEqual(accounts[0].email, 'b@example.com');
    });

    test('setSelectedSurgeAccount selects exactly one account', async () => {
        await Storage.addSurgeAccount(new SurgeAccount('a@example.com', 'pw1'));
        await Storage.addSurgeAccount(new SurgeAccount('b@example.com', 'pw2'));

        await Storage.setSelectedSurgeAccount('b@example.com');

        assert.strictEqual(Storage.getSelectedSurgeAccount()?.email, 'b@example.com');
        assert.strictEqual(Storage.getSurgeAccount('a@example.com')?.isSelected, false);
    });

    test('setSelectedSurgeAccount(null) clears the selection', async () => {
        await Storage.addSurgeAccount(new SurgeAccount('a@example.com', 'pw1'));
        await Storage.setSelectedSurgeAccount('a@example.com');

        await Storage.setSelectedSurgeAccount(null);

        assert.strictEqual(Storage.getSelectedSurgeAccount(), undefined);
    });

    test('getTargetFolder / setTargetFolder round-trip', async () => {
        assert.strictEqual(Storage.getTargetFolder(), undefined);

        await Storage.setTargetFolder('/home/user/project');

        assert.strictEqual(Storage.getTargetFolder(), '/home/user/project');
    });
});
