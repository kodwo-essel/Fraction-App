import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { SQLiteDatabase } from 'expo-sqlite';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { calculateAllocation, validatePercentages } from '../services/allocation';
import { Category, initDatabase, RuleVersion, Transaction } from '../services/database';

interface AppContextType {
    categories: Category[];
    transactions: Transaction[];
    currentRule: RuleVersion | null;
    isLoading: boolean;
    userName: string | null;
    setUserName: (name: string) => Promise<void>;
    addIncome: (amount: number, name: string, description?: string) => Promise<void>;
    addExpense: (categoryId: string, amount: number, name: string, description?: string) => Promise<void>;
    updateCategories: (updatedCategories: Category[]) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    deleteTransaction: (id: string, groupId?: string) => Promise<void>;
    clearTransactions: () => Promise<void>;
    resetDatabase: () => Promise<void>;
    getCategoryBalance: (id: string) => number;
    refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [db, setDb] = useState<SQLiteDatabase | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [currentRule, setCurrentRule] = useState<RuleVersion | null>(null);
    const [userName, setUserNameState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshData = useCallback(async () => {
        if (!db) return;
        try {
            const allCategories = await db.getAllAsync<Category>('SELECT * FROM categories ORDER BY type ASC, name ASC');
            const allTransactions = await db.getAllAsync<Transaction>('SELECT * FROM transactions ORDER BY created_at DESC');
            const latestRule = await db.getFirstAsync<RuleVersion>('SELECT * FROM rule_versions ORDER BY created_at DESC');

            setCategories(allCategories);
            setTransactions(allTransactions);
            setCurrentRule(latestRule || null);
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }, [db]);

    useEffect(() => {
        const setup = async () => {
            try {
                const database = await initDatabase();
                setDb(database);

                // Initialize default categories if none exist
                const countResult = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM categories');
                if (countResult?.count === 0) {
                    const defaultRuleId = Crypto.randomUUID();
                    const defaultCats: Partial<Category>[] = [
                        { id: Crypto.randomUUID(), name: 'Tithes', percentage: 10, type: 'main', is_protected: true },
                        { id: Crypto.randomUUID(), name: 'Wealth', percentage: 30, type: 'main', is_protected: true },
                        { id: Crypto.randomUUID(), name: 'Core', percentage: 25, type: 'main', is_protected: false },
                        { id: Crypto.randomUUID(), name: 'Lifestyle', percentage: 20, type: 'main', is_protected: false },
                        { id: Crypto.randomUUID(), name: 'Personal', percentage: 15, type: 'main', is_protected: false },
                    ];

                    // Wealth Subcategories
                    const wealthId = defaultCats.find(c => c.name === 'Wealth')?.id;
                    if (wealthId) {
                        defaultCats.push(
                            { id: Crypto.randomUUID(), name: 'Emergency', percentage: 50, type: 'sub', parent_id: wealthId, is_protected: false },
                            { id: Crypto.randomUUID(), name: 'Savings', percentage: 33.33, type: 'sub', parent_id: wealthId, is_protected: false },
                            { id: Crypto.randomUUID(), name: 'Investment', percentage: 16.67, type: 'sub', parent_id: wealthId, is_protected: false },
                        );
                    }

                    for (const cat of defaultCats) {
                        await database.runAsync(
                            'INSERT INTO categories (id, name, percentage, type, parent_id, is_protected) VALUES (?, ?, ?, ?, ?, ?)',
                            [cat.id!, cat.name!, cat.percentage!, cat.type!, cat.parent_id || null, cat.is_protected ? 1 : 0]
                        );
                    }

                    await database.runAsync(
                        'INSERT INTO rule_versions (id, config_snapshot) VALUES (?, ?)',
                        [defaultRuleId, JSON.stringify(defaultCats)]
                    );
                }
                // Load user name
                const savedName = await AsyncStorage.getItem('user_name');
                setUserNameState(savedName);
            } catch (error) {
                console.error('Critical Database Error:', error);
                // We could set an error state here and show it in the UI
            } finally {
                setIsLoading(false);
            }
        };
        setup();
    }, []);

    const setUserName = async (name: string) => {
        setUserNameState(name);
        await AsyncStorage.setItem('user_name', name);
    };

    useEffect(() => {
        if (db) refreshData();
    }, [db, refreshData]);

    const addIncome = async (amount: number, name: string, description?: string) => {
        if (!db || !currentRule) return;
        const allocation = calculateAllocation(amount, categories);
        const ruleSnapshot = currentRule.config_snapshot;
        const groupId = Crypto.randomUUID();

        const saveAllocations = async (items: any[]) => {
            for (const item of items) {
                // Only record in DB if it's a leaf node (no sub-allocations)
                // OR if it's a main category without children
                if (!item.subAllocations || item.subAllocations.length === 0) {
                    await db.runAsync(
                        'INSERT INTO transactions (id, type, amount, category_id, name, description, rule_snapshot, group_id, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [Crypto.randomUUID(), 'income', item.amount, item.categoryId, name, description || null, ruleSnapshot, groupId, amount]
                    );
                }

                if (item.subAllocations) {
                    await saveAllocations(item.subAllocations);
                }
            }
        };

        await saveAllocations(allocation);
        await refreshData();
    };

    const addExpense = async (categoryId: string, amount: number, name: string, description?: string) => {
        if (!db || !currentRule) return;
        const id = Crypto.randomUUID();
        await db.runAsync(
            'INSERT INTO transactions (id, type, amount, category_id, name, description, rule_snapshot, group_id, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, 'expense', amount, categoryId, name, description || null, currentRule.config_snapshot, id, amount]
        );
        await refreshData();
    };

    const updateCategories = async (updatedCategories: Category[]) => {
        if (!db) return;
        if (!validatePercentages(updatedCategories)) {
            throw new Error('Total percentages must sum to 100%');
        }

        // Begin transaction for safety
        await db.withTransactionAsync(async () => {
            // 1. Save new rule version
            const ruleId = Crypto.randomUUID();
            await db.runAsync(
                'INSERT INTO rule_versions (id, config_snapshot) VALUES (?, ?)',
                [ruleId, JSON.stringify(updatedCategories)]
            );

            // 2. Update existing or insert new categories
            // For simplicity in this demo, we'll clear and re-insert if no transactions exist, 
            // or just update if they do. Actually, the requirement says "Past entries remain unchanged".
            // We should keep IDs consistent where possible.
            for (const cat of updatedCategories) {
                await db.runAsync(
                    `INSERT INTO categories (id, name, percentage, type, parent_id, is_protected) 
           VALUES (?, ?, ?, ?, ?, ?) 
           ON CONFLICT(id) DO UPDATE SET 
           name=excluded.name, 
           percentage=excluded.percentage, 
           type=excluded.type, 
           parent_id=excluded.parent_id, 
           is_protected=excluded.is_protected, 
           updated_at=CURRENT_TIMESTAMP`,
                    [cat.id, cat.name, cat.percentage, cat.type, cat.parent_id, cat.is_protected ? 1 : 0]
                );
            }
        });

        await refreshData();
    };

    const deleteCategory = async (id: string) => {
        if (!db) return;
        const hasTransactions = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?',
            [id]
        );
        if (hasTransactions && hasTransactions.count > 0) {
            throw new Error('Cannot delete category with existing transactions.');
        }
        await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
        await refreshData();
    };

    const deleteTransaction = async (id: string, groupId?: string) => {
        if (!db) return;
        if (groupId) {
            await db.runAsync('DELETE FROM transactions WHERE group_id = ?', [groupId]);
        } else {
            await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
        }
        await refreshData();
    };

    const clearTransactions = async () => {
        if (!db) return;
        await db.runAsync('DELETE FROM transactions');
        await refreshData();
    };

    const resetDatabase = async () => {
        if (!db) return;

        await db.withTransactionAsync(async () => {
            await db.runAsync('DELETE FROM transactions');
            await db.runAsync('DELETE FROM categories');
            await db.runAsync('DELETE FROM rule_versions');

            // Re-initialize defaults
            const defaultRuleId = Crypto.randomUUID();
            const defaultCats: Partial<Category>[] = [
                { id: Crypto.randomUUID(), name: 'Tithes', percentage: 10, type: 'main', is_protected: true },
                { id: Crypto.randomUUID(), name: 'Wealth', percentage: 30, type: 'main', is_protected: true },
                { id: Crypto.randomUUID(), name: 'Core', percentage: 25, type: 'main', is_protected: false },
                { id: Crypto.randomUUID(), name: 'Lifestyle', percentage: 20, type: 'main', is_protected: false },
                { id: Crypto.randomUUID(), name: 'Personal', percentage: 15, type: 'main', is_protected: false },
            ];

            const wealthId = defaultCats.find(c => c.name === 'Wealth')?.id;
            if (wealthId) {
                defaultCats.push(
                    { id: Crypto.randomUUID(), name: 'Emergency', percentage: 50, type: 'sub', parent_id: wealthId, is_protected: false },
                    { id: Crypto.randomUUID(), name: 'Savings', percentage: 33.33, type: 'sub', parent_id: wealthId, is_protected: false },
                    { id: Crypto.randomUUID(), name: 'Investment', percentage: 16.67, type: 'sub', parent_id: wealthId, is_protected: false },
                );
            }

            for (const cat of defaultCats) {
                await db.runAsync(
                    'INSERT INTO categories (id, name, percentage, type, parent_id, is_protected) VALUES (?, ?, ?, ?, ?, ?)',
                    [cat.id!, cat.name!, cat.percentage!, cat.type!, cat.parent_id || null, cat.is_protected ? 1 : 0]
                );
            }

            await db.runAsync(
                'INSERT INTO rule_versions (id, config_snapshot) VALUES (?, ?)',
                [defaultRuleId, JSON.stringify(defaultCats)]
            );
        });

        await refreshData();
    };

    const getCategoryBalance = (id: string) => {
        const subCategoryIds = categories.filter(c => c.parent_id === id).map(c => c.id);
        const targetIds = [id, ...subCategoryIds];

        // Note: For multi-level nesting we'd need recursion, but schema only supports one level of sub
        const catTransactions = transactions.filter(t => targetIds.includes(t.category_id));
        return catTransactions.reduce((acc, t) => {
            return t.type === 'income' ? acc + t.amount : acc - t.amount;
        }, 0);
    };

    return (
        <AppContext.Provider value={{
            categories,
            transactions,
            currentRule,
            userName,
            isLoading,
            setUserName,
            addIncome,
            addExpense,
            updateCategories,
            deleteCategory,
            deleteTransaction,
            clearTransactions,
            resetDatabase,
            getCategoryBalance,
            refreshData
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
