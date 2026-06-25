import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { SQLiteDatabase } from 'expo-sqlite';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { calculateAllocation, validatePercentages } from '../services/allocation';
import { Category, initDatabase, RuleVersion, Transaction } from '../services/database';
import { defaultTheme, themes, Theme } from '../constants/theme';

interface AppContextType {
    categories: Category[];
    transactions: Transaction[];
    currentRule: RuleVersion | null;
    isLoading: boolean;
    userName: string | null;
    avatarId: string | null;
    themeName: string;
    theme: Theme;
    setUserName: (name: string) => Promise<void>;
    setAvatarId: (id: string | null) => Promise<void>;
    setThemeName: (name: string) => Promise<void>;
    addIncome: (amount: number, name: string, description?: string) => Promise<void>;
    addExpense: (categoryId: string, amount: number, name: string, description?: string) => Promise<void>;
    updateCategories: (updatedCategories: Category[]) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    deleteTransaction: (id: string, groupId?: string) => Promise<void>;
    clearTransactions: () => Promise<void>;
    resetDatabase: () => Promise<void>;
    currencyCode: string;
    setCurrencyCode: (code: string) => Promise<void>;
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
    const [avatarId, setAvatarIdState] = useState<string | null>(null);
    const [currencyCode, setCurrencyCodeState] = useState<string>('GHS');
    const [themeName, setThemeNameState] = useState<string>('minimalist');
    const [isLoading, setIsLoading] = useState(true);

    const theme = themes[themeName] || defaultTheme;

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

                // Initialize empty state with only system_others if no categories exist
                const countResult = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM categories');
                if (countResult?.count === 0) {
                    await database.runAsync(
                        'INSERT INTO categories (id, name, percentage, type, parent_id, is_protected) VALUES (?, ?, ?, ?, ?, ?)',
                        ['system_others', 'Others', 0, 'main', null, 1]
                    );

                    const defaultRuleId = Crypto.randomUUID();
                    await database.runAsync(
                        'INSERT INTO rule_versions (id, config_snapshot) VALUES (?, ?)',
                        [defaultRuleId, JSON.stringify([{ id: 'system_others', name: 'Others', percentage: 0, type: 'main', is_protected: true }])]
                    );
                } else {
                    // Ensure "Others" category exists for legacy users who have other categories
                    const othersExists = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM categories WHERE id = ?', ['system_others']);
                    if (othersExists?.count === 0) {
                        await database.runAsync(
                            'INSERT INTO categories (id, name, percentage, type, parent_id, is_protected) VALUES (?, ?, ?, ?, ?, ?)',
                            ['system_others', 'Others', 0, 'main', null, 1]
                        );
                    }
                }
                // Load user settings
                const [savedName, savedCurrency, savedTheme, savedAvatar] = await Promise.all([
                    AsyncStorage.getItem('user_name'),
                    AsyncStorage.getItem('currency_code'),
                    AsyncStorage.getItem('theme_mode'),
                    AsyncStorage.getItem('avatar_id')
                ]);
                setUserNameState(savedName);
                if (savedCurrency) setCurrencyCodeState(savedCurrency);
                if (savedTheme && themes[savedTheme]) {
                  setThemeNameState(savedTheme);
                }
                if (savedAvatar) setAvatarIdState(savedAvatar);
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

    const setThemeName = async (name: string) => {
        setThemeNameState(name);
        await AsyncStorage.setItem('theme_mode', name);
    };

    const setAvatarId = async (id: string | null) => {
        setAvatarIdState(id);
        if (id) {
            await AsyncStorage.setItem('avatar_id', id);
        } else {
            await AsyncStorage.removeItem('avatar_id');
        }
    };

    const setCurrencyCode = async (code: string) => {
        setCurrencyCodeState(code);
        await AsyncStorage.setItem('currency_code', code);
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

            // Re-initialize with only "Others"
            await db.runAsync(
                'INSERT INTO categories (id, name, percentage, type, parent_id, is_protected) VALUES (?, ?, ?, ?, ?, ?)',
                ['system_others', 'Others', 0, 'main', null, 1]
            );

            const defaultRuleId = Crypto.randomUUID();
            await db.runAsync(
                'INSERT INTO rule_versions (id, config_snapshot) VALUES (?, ?)',
                [defaultRuleId, JSON.stringify([{ id: 'system_others', name: 'Others', percentage: 0, type: 'main', is_protected: true }])]
            );
        });

        // Clear personality and settings
        await AsyncStorage.multiRemove(['user_name', 'biometric_enabled', 'biometrics_enabled', 'theme_mode', 'avatar_id']);
        setUserNameState(null);
        setThemeNameState('minimalist');
        setAvatarIdState(null);

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
            avatarId,
            currencyCode,
            themeName,
            theme,
            isLoading,
            setUserName,
            setAvatarId,
            setThemeName,
            setCurrencyCode,
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

