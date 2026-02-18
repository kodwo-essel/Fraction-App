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
  group_id: string;
  total_amount: number;
}

export interface RuleVersion {
  id: string;
  created_at: string;
  config_snapshot: string;
}

let isInitializing = false;
let dbInstance: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async () => {
  if (isInitializing) {
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  if (dbInstance) return dbInstance;

  isInitializing = true;
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);

    // 1. Enable Foreign Keys
    try {
      await db.execAsync('PRAGMA foreign_keys = ON;');
    } catch (e) {
      console.error('Error enabling foreign keys:', e);
      throw e;
    }

    // 2. Create Categories Table
    try {
      await db.execAsync(`
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
      `);
    } catch (e) {
      console.error('Error creating categories table:', e);
      throw e;
    }

    // 3. Create Transactions Table
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY NOT NULL,
          type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
          amount REAL NOT NULL,
          category_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          rule_snapshot TEXT NOT NULL,
          group_id TEXT,
          total_amount REAL,
          FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
        );
      `);
    } catch (e) {
      console.error('Error creating transactions table:', e);
      throw e;
    }

    // 4. Create Rule Versions Table
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS rule_versions (
          id TEXT PRIMARY KEY NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          config_snapshot TEXT NOT NULL
        );
      `);
    } catch (e) {
      console.error('Error creating rule_versions table:', e);
      throw e;
    }

    // 5. Migration: name and description columns
    try {
      const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(transactions);');
      if (!columns.some(col => col.name === 'name')) {
        await db.execAsync("ALTER TABLE transactions ADD COLUMN name TEXT DEFAULT 'Transaction';");
      }
      if (!columns.some(col => col.name === 'description')) {
        await db.execAsync('ALTER TABLE transactions ADD COLUMN description TEXT;');
      }
    } catch (e) {
      console.error('Error migrating name/description columns:', e);
      throw e;
    }

    // 6. Migration: group_id column
    try {
      const columns2 = await db.getAllAsync<{ name: string }>('PRAGMA table_info(transactions);');
      if (!columns2.some(col => col.name === 'group_id')) {
        await db.execAsync('ALTER TABLE transactions ADD COLUMN group_id TEXT;');
        await db.runAsync('UPDATE transactions SET group_id = id WHERE group_id IS NULL');
      }
    } catch (e) {
      console.error('Error migrating group_id column:', e);
      throw e;
    }

    // 7. Migration: total_amount column
    try {
      const columns3 = await db.getAllAsync<{ name: string }>('PRAGMA table_info(transactions);');
      if (!columns3.some(col => col.name === 'total_amount')) {
        await db.execAsync('ALTER TABLE transactions ADD COLUMN total_amount REAL;');
        // Backfill total_amount with current amount
        await db.runAsync('UPDATE transactions SET total_amount = amount WHERE total_amount IS NULL');
      }
    } catch (e) {
      console.error('Error migrating total_amount column:', e);
      throw e;
    }

    dbInstance = db;
    return db;
  } catch (e) {
    console.error('Database initialization failed:', e);
    dbInstance = null; // Ensure dbInstance is null if initialization fails
    throw e; // Re-throw the error to indicate failure
  } finally {
    isInitializing = false;
  }
};
