import * as SQLite from 'expo-sqlite';

const DB_NAME = 'fraction.db';

export interface Category {
  id: string;
  name: string;
  percentage: number;
  type: 'main' | 'sub';
  parent_id: string | null;
  is_protected: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category_id: string;
  name: string;
  description?: string;
  created_at: string;
  rule_snapshot: string;
}

export interface RuleVersion {
  id: string;
  created_at: string;
  config_snapshot: string;
}

let isInitializing = false;
let dbInstance: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async () => {
  if (dbInstance) return dbInstance;
  if (isInitializing) {
    // Wait until initialization is complete
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return dbInstance!;
  }

  isInitializing = true;
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    dbInstance = db;

    // Perform all schema operations in one go
    await db.execAsync(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        percentage REAL NOT NULL,
        type TEXT CHECK(type IN ('main', 'sub')) NOT NULL,
        parent_id TEXT,
        is_protected INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        amount REAL NOT NULL,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        rule_snapshot TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS rule_versions (
        id TEXT PRIMARY KEY NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        config_snapshot TEXT NOT NULL
      );
    `);

    // Migration: Check if name column exists, if not add it
    // We use a separate check to avoid ALTER TABLE errors if already exists
    const tableInfo = await db.getAllAsync<{ name: string }>('PRAGMA table_info(transactions);');
    const hasName = tableInfo.some(col => col.name === 'name');

    if (!hasName) {
      // Use withTransactionAsync for migration safety
      await db.withTransactionAsync(async () => {
        // Need to check again inside transaction just in case
        const innerInfo = await db.getAllAsync<{ name: string }>('PRAGMA table_info(transactions);');
        if (!innerInfo.some(col => col.name === 'name')) {
          await db.execAsync("ALTER TABLE transactions ADD COLUMN name TEXT DEFAULT 'Transaction';");
          await db.execAsync('ALTER TABLE transactions ADD COLUMN description TEXT;');
        }
      });
    }

    return db;
  } finally {
    isInitializing = false;
  }
};
