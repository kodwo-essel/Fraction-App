import * as Crypto from 'expo-crypto';
import * as DocumentPicker from 'expo-document-picker';
import { cacheDirectory, readAsStringAsync, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as SQLite from 'expo-sqlite';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BackupFile {
    version: number;
    created_at: string;
    meta: {
        userName: string;
        currencyCode: string;
    };
    categories: any[];
    transactions: any[];
    rule_versions: any[];
}

// ─── Backup ───────────────────────────────────────────────────────────────────

export const createBackup = async (
    db: SQLite.SQLiteDatabase,
    currencyCode: string,
    userName: string
): Promise<void> => {
    const categories = await db.getAllAsync('SELECT * FROM categories;');
    const transactions = await db.getAllAsync('SELECT * FROM transactions;');
    const ruleVersions = await db.getAllAsync('SELECT * FROM rule_versions;');

    const backup: BackupFile = {
        version: 1,
        created_at: new Date().toISOString(),
        meta: { userName, currencyCode },
        categories,
        transactions,
        rule_versions: ruleVersions,
    };

    const json = JSON.stringify(backup, null, 2);
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `fraction-backup-${dateStr}.json`;
    const fileUri = `${cacheDirectory}${fileName}`;

    await writeAsStringAsync(fileUri, json, {
        encoding: EncodingType.UTF8,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
        throw new Error('Sharing is not available on this device.');
    }

    await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Save your Fraction backup',
        UTI: 'public.json',
    });
};

// ─── Restore ──────────────────────────────────────────────────────────────────

export interface PendingRestore {
    backup: BackupFile;
    hash: string;
}

export type PickResult =
    | { status: 'pending'; data: PendingRestore }
    | { status: 'duplicate' }
    | { status: 'cancelled' }
    | { status: 'invalid'; reason: string };

/** Step 1 — open file picker, validate, hash. No DB writes yet. */
export const pickBackupFile = async (
    db: SQLite.SQLiteDatabase
): Promise<PickResult> => {
    const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
    });

    if (result.canceled) return { status: 'cancelled' };

    const fileUri = result.assets[0].uri;

    // Read
    let raw: string;
    try {
        raw = await readAsStringAsync(fileUri, { encoding: EncodingType.UTF8 });
    } catch {
        return { status: 'invalid', reason: 'Could not read the selected file.' };
    }

    // Parse
    let backup: BackupFile;
    try {
        backup = JSON.parse(raw);
    } catch {
        return { status: 'invalid', reason: 'The file is not valid JSON.' };
    }

    // Validate structure
    if (
        backup.version !== 1 ||
        !Array.isArray(backup.categories) ||
        !Array.isArray(backup.transactions) ||
        !Array.isArray(backup.rule_versions) ||
        !backup.meta?.currencyCode
    ) {
        return { status: 'invalid', reason: 'This does not appear to be a Fraction backup file.' };
    }

    // Hash — check for duplicate
    const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        raw
    );

    const existing = await db.getFirstAsync<{ hash: string }>(
        'SELECT hash FROM backup_hashes WHERE hash = ?;',
        [hash]
    );
    if (existing) return { status: 'duplicate' };

    return { status: 'pending', data: { backup, hash } };
};

/** Step 2 — called after user confirms. Replaces all DB data atomically. */
export const applyBackup = async (
    db: SQLite.SQLiteDatabase,
    { backup, hash }: PendingRestore
): Promise<void> => {
    await db.withTransactionAsync(async () => {
        await db.execAsync('DELETE FROM transactions;');
        await db.execAsync('DELETE FROM rule_versions;');
        await db.execAsync('DELETE FROM categories;');

        for (const cat of backup.categories) {
            await db.runAsync(
                `INSERT OR REPLACE INTO categories
                 (id, name, percentage, type, parent_id, is_protected, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
                [cat.id, cat.name, cat.percentage, cat.type, cat.parent_id ?? null,
                 cat.is_protected ? 1 : 0, cat.created_at, cat.updated_at]
            );
        }

        for (const tx of backup.transactions) {
            await db.runAsync(
                `INSERT OR REPLACE INTO transactions
                 (id, type, amount, category_id, name, description, created_at, rule_snapshot, group_id, total_amount)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [tx.id, tx.type, tx.amount, tx.category_id, tx.name,
                 tx.description ?? null, tx.created_at, tx.rule_snapshot,
                 tx.group_id ?? null, tx.total_amount ?? tx.amount]
            );
        }

        for (const rv of backup.rule_versions) {
            await db.runAsync(
                `INSERT OR REPLACE INTO rule_versions (id, created_at, config_snapshot)
                 VALUES (?, ?, ?);`,
                [rv.id, rv.created_at, rv.config_snapshot]
            );
        }

        await db.runAsync(
            'INSERT INTO backup_hashes (hash) VALUES (?);',
            [hash]
        );
    });
};

