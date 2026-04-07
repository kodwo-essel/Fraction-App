import { Category } from '@/services/database';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { Plus, Trash2, Globe, Database, Save, ChevronLeft, Search, X, Info } from 'lucide-react-native';
import React, { useEffect, useState, useMemo } from 'react';
import { ScrollView, StyleSheet, Switch, TextInput, View, Modal, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useAlert } from '../context/AlertContext';
import { EntryTransition } from '../components/EntryTransition';
import { PressableScale } from '../components/PressableScale';
import { Text, Card, Button } from '../components/Themed';

import CURRENCIES from '../constants/currencies.json';

export default function Configuration() {
    const { categories, updateCategories, deleteCategory, currencyCode, setCurrencyCode, theme, themeMode } = useApp();
    const { showAlert } = useAlert();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [localCategories, setLocalCategories] = useState<Category[]>([]);
    const [localCurrencyCode, setLocalCurrencyCode] = useState(currencyCode);
    const [isModified, setIsModified] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const styles = getStyles(theme, themeMode);

    useEffect(() => {
        if (categories.length > 0) {
            setLocalCategories(JSON.parse(JSON.stringify(categories)));
        }
    }, [categories]);

    useEffect(() => {
        setLocalCurrencyCode(currencyCode);
    }, [currencyCode]);

    const calculateTotal = (parentId: string | null) => {
        return localCategories
            .filter(c => c.parent_id === parentId)
            .reduce((sum, c) => sum + (c.percentage || 0), 0);
    };

    const handleUpdatePercentage = (id: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setLocalCategories(prev => prev.map(c =>
            c.id === id ? { ...c, percentage: numValue } : c
        ));
        setIsModified(true);
    };

    const handleUpdateName = (id: string, name: string) => {
        setLocalCategories(prev => prev.map(c =>
            c.id === id ? { ...c, name } : c
        ));
        setIsModified(true);
    };

    const handleToggleProtected = (id: string) => {
        setLocalCategories(prev => prev.map(c =>
            c.id === id ? { ...c, is_protected: !c.is_protected } : c
        ));
        setIsModified(true);
    };

    const handleAddCategory = (parentId: string | null = null) => {
        const newCat: Category = {
            id: Crypto.randomUUID(),
            name: 'New Custom Rule',
            percentage: 0,
            type: parentId ? 'sub' : 'main',
            parent_id: parentId,
            is_protected: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        setLocalCategories(prev => [...prev, newCat]);
        setIsModified(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteCategory(id);
            setLocalCategories(prev => prev.filter(c => c.id !== id));
            setIsModified(true);
        } catch (error: any) {
            showAlert({ title: 'Restriction', message: error.message });
        }
    };

    const handleSave = async () => {
        const mainTotal = calculateTotal(null);
        if (mainTotal > 100.01) {
            showAlert({ 
                title: 'Threshold Exceeded', 
                message: `Main rules cannot sum > 100% (Current: ${mainTotal}%)` 
            });
            return;
        }

        const mainsWithSubs = localCategories.filter(c =>
            localCategories.some(sub => sub.parent_id === c.id)
        );
        for (const main of mainsWithSubs) {
            const subTotal = calculateTotal(main.id);
            if (subTotal > 100.01) {
                showAlert({ 
                    title: 'Sub-rule Error', 
                    message: `${main.name} branch exceeds 100% (Current: ${subTotal}%)` 
                });
                return;
            }
        }

        try {
            // Commit rules
            await updateCategories(localCategories);
            
            // Commit currency if changed
            if (localCurrencyCode !== currencyCode) {
                await setCurrencyCode(localCurrencyCode);
            }

            setIsModified(false);
            showAlert({ 
                title: 'Applied', 
                message: 'Financial configuration saved successfully.' 
            });
        } catch (error: any) {
            showAlert({ title: 'Sync Error', message: error.message });
        }
    };

    const filteredCurrencies = useMemo(() => {
        if (!searchQuery) return CURRENCIES;
        return CURRENCIES.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            c.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const activeCurrency = useMemo(() => 
        CURRENCIES.find(c => c.code === localCurrencyCode) || CURRENCIES.find(c => c.code === 'GHS') || CURRENCIES[0]
    , [localCurrencyCode]);

    const mainCategories = localCategories.filter(c => c.type === 'main' && c.id !== 'system_others');

    const hasActualChanges = isModified || localCurrencyCode !== currencyCode;

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: insets.top + theme.spacing.lg, paddingBottom: insets.bottom + 40 }
                ]}
            >
                <EntryTransition delay={0}>
                    <View style={styles.header}>
                        <PressableScale onPress={() => router.back()} style={styles.backBtn}>
                            <ChevronLeft size={28} color={theme.colors.text} />
                        </PressableScale>
                        <View>
                            <Text variant="h1" style={styles.title}>Configuration</Text>
                            <Text variant="label" color="textSecondary">Configure System Rules</Text>
                        </View>
                    </View>
                </EntryTransition>

                {/* Section: Localization */}
                <EntryTransition delay={100}>
                    <View style={styles.section}>
                        <Text variant="label" color="textSecondary" style={styles.sectionLabel}>System Currency</Text>
                        <PressableScale onPress={() => setIsPickerVisible(true)}>
                            <Card style={styles.currencyTile}>
                                <View style={styles.currencyTileLeft}>
                                    <View style={[
                                        styles.currencySymbolBox, 
                                        activeCurrency.symbol.length > 2 && { minWidth: 80, paddingHorizontal: 12 }
                                    ]}>
                                        <Text 
                                            numberOfLines={1}
                                            style={[
                                                styles.symbolText,
                                                { fontSize: 24, lineHeight: 24, transform: [{ translateY: 2 }], color: theme.colors.primary },
                                                activeCurrency.symbol.length === 2 && { fontSize: 22, lineHeight: 22 },
                                                activeCurrency.symbol.length === 3 && { fontSize: 20, lineHeight: 20 },
                                                activeCurrency.symbol.length > 3 && { fontSize: 16, lineHeight: 16 }
                                            ]}
                                        >
                                            {activeCurrency.symbol}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text variant="body" style={{ fontFamily: theme.typography.fontFamily.bold }}>{activeCurrency.name}</Text>
                                        <Text variant="caption" color="textSecondary">{activeCurrency.code}</Text>
                                    </View>
                                </View>
                                <Globe size={20} color={theme.colors.textSecondary} />
                            </Card>
                        </PressableScale>
                    </View>
                </EntryTransition>

                {/* Section: Allocation Framework */}
                <EntryTransition delay={200}>
                    <View style={styles.section}>
                        <View style={styles.sectionRow}>
                            <Text variant="h3" color="textSecondary">Primary Rules</Text>
                            <View style={[styles.totalBadge, { backgroundColor: calculateTotal(null) > 100 ? theme.colors.error : calculateTotal(null) === 100 ? theme.colors.success : theme.colors.primary + '20' }]}>
                                <Text variant="h3" style={{ color: calculateTotal(null) > 100 ? '#fff' : calculateTotal(null) === 100 ? '#fff' : theme.colors.primary }}>
                                    {calculateTotal(null)}%
                                </Text>
                            </View>
                        </View>

                        {mainCategories.map(cat => (
                            <Card key={cat.id} style={styles.ruleBlock}>
                                <View style={styles.ruleRow}>
                                    <TextInput
                                        style={[styles.ruleNameInput, { color: theme.colors.text, borderBottomColor: theme.colors.border }]}
                                        value={cat.name}
                                        onChangeText={(val) => handleUpdateName(cat.id, val)}
                                        selectionColor={theme.colors.primary}
                                        placeholder="Category Name"
                                        placeholderTextColor={theme.colors.textSecondary}
                                    />
                                    <View style={[styles.percInputWrapper, { borderBottomColor: theme.colors.border }]}>
                                        <TextInput
                                            style={[styles.percInput, { color: theme.colors.text }]}
                                            value={cat.percentage.toString()}
                                            onChangeText={(val) => handleUpdatePercentage(cat.id, val)}
                                            keyboardType="numeric"
                                            selectionColor={theme.colors.primary}
                                        />
                                        <Text variant="caption" color="textSecondary">%</Text>
                                    </View>
                                    <PressableScale onPress={() => handleDelete(cat.id)} style={styles.iconBtn}>
                                        <Trash2 size={18} color={theme.colors.error} />
                                    </PressableScale>
                                </View>

                                <View style={styles.ruleOptions}>
                                    <View style={styles.protectionToggle}>
                                        <Text variant="caption" color="textSecondary">Income Only</Text>
                                        <Switch
                                            value={cat.is_protected}
                                            onValueChange={() => handleToggleProtected(cat.id)}
                                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                            thumbColor={theme.colors.background}
                                        />
                                    </View>
                                    <PressableScale 
                                        style={styles.addSubBtn} 
                                        onPress={() => handleAddCategory(cat.id)}
                                    >
                                        <Plus size={14} color={theme.colors.text} />
                                        <Text variant="caption" style={[styles.addSubText, { color: theme.colors.text }]}>Sub-rule</Text>
                                    </PressableScale>
                                </View>

                                {localCategories.filter(s => s.parent_id === cat.id).map(sub => (
                                    <View key={sub.id} style={styles.subRuleRow}>
                                        <View style={[styles.subRuleIndent, { backgroundColor: theme.colors.border }]} />
                                        <TextInput
                                            style={[styles.subRuleNameInput, { color: theme.colors.text }]}
                                            value={sub.name}
                                            onChangeText={(val) => handleUpdateName(sub.id, val)}
                                            selectionColor={theme.colors.primary}
                                            placeholder="Sub-rule Name"
                                            placeholderTextColor={theme.colors.textSecondary}
                                        />
                                        <View style={[styles.percInputWrapper, { borderBottomColor: theme.colors.border }]}>
                                            <TextInput
                                                style={[styles.subPercInput, { color: theme.colors.textSecondary }]}
                                                value={sub.percentage.toString()}
                                                onChangeText={(val) => handleUpdatePercentage(sub.id, val)}
                                                keyboardType="numeric"
                                                selectionColor={theme.colors.primary}
                                            />
                                            <Text variant="caption" color="textSecondary">%</Text>
                                        </View>
                                        <PressableScale onPress={() => handleDelete(sub.id)} style={styles.iconBtn}>
                                            <Trash2 size={16} color={theme.colors.textSecondary} />
                                        </PressableScale>
                                    </View>
                                ))}
                            </Card>
                        ))}

                        <PressableScale style={[styles.addMainBtn, { borderColor: theme.colors.border }]} onPress={() => handleAddCategory(null)}>
                            <Plus size={20} color={theme.colors.text} />
                            <Text variant="body" style={[styles.addMainText, { color: theme.colors.text }]}>Add Primary Rule</Text>
                        </PressableScale>
                    </View>
                </EntryTransition>

                <Modal 
                    visible={isPickerVisible} 
                    animationType="slide" 
                    transparent 
                    onRequestClose={() => setIsPickerVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text variant="h3">Select Currency</Text>
                                <PressableScale onPress={() => setIsPickerVisible(false)}>
                                    <X size={24} color={theme.colors.text} />
                                </PressableScale>
                            </View>
                            
                            <View style={styles.searchBox}>
                                <Search size={18} color={theme.colors.textSecondary} />
                                <TextInput
                                    style={[styles.searchInput, { color: theme.colors.text }]}
                                    placeholder="Search global currencies..."
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    selectionColor={theme.colors.primary}
                                />
                            </View>

                            <FlatList
                                data={filteredCurrencies}
                                keyExtractor={(item) => item.code}
                                contentContainerStyle={styles.pickerList}
                                renderItem={({ item }) => (
                                    <PressableScale 
                                        onPress={() => {
                                            setLocalCurrencyCode(item.code);
                                            setIsPickerVisible(false);
                                            setSearchQuery('');
                                        }}
                                        style={[
                                            styles.pickerItem,
                                            localCurrencyCode === item.code && styles.pickerItemActive
                                        ]}
                                    >
                                        <Text 
                                            numberOfLines={1}
                                            style={[
                                                styles.symbolText,
                                                { width: 54, fontSize: 20, lineHeight: 20, transform: [{ translateY: 1 }], color: theme.colors.text },
                                                item.symbol.length > 3 && { fontSize: 14, lineHeight: 14 }
                                            ]}
                                        >
                                            {item.symbol}
                                        </Text>
                                        <View style={{ flex: 1 }}>
                                            <Text variant="body" style={{ fontFamily: theme.typography.fontFamily.bold }}>{item.name}</Text>
                                            <Text variant="caption" color="textSecondary">{item.code}</Text>
                                        </View>
                                        {localCurrencyCode === item.code && <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />}
                                    </PressableScale>
                                )}
                            />
                        </View>
                    </View>
                </Modal>

                {hasActualChanges && (
                    <EntryTransition delay={300}>
                        <Button
                            title="Save Configuration"
                            variant="primary"
                            onPress={handleSave}
                            style={styles.saveBtn}
                        />
                    </EntryTransition>
                )}
            </ScrollView>
        </View>
    );
}

const getStyles = (theme: any, mode: string) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
        gap: theme.spacing.md,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        letterSpacing: -1.5,
        marginBottom: 2,
    },
    section: {
        marginBottom: theme.spacing.xxl,
    },
    sectionLabel: {
        marginBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.xs,
    },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.xs,
    },
    totalBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    currencyTile: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        borderRadius: 20,
    },
    currencyTileLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    currencySymbolBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    symbolText: {
        fontFamily: theme.typography.fontFamily.bold,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '85%',
        padding: theme.spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xl,
        paddingHorizontal: theme.spacing.xs,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        paddingHorizontal: theme.spacing.md,
        height: 56,
        marginBottom: theme.spacing.lg,
        gap: theme.spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 16,
    },
    pickerList: {
        paddingBottom: 40,
    },
    pickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderRadius: 16,
        marginBottom: 8,
        gap: theme.spacing.md,
    },
    pickerItemActive: {
        backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
    },
    ruleBlock: {
        marginBottom: theme.spacing.lg,
        padding: theme.spacing.lg,
        backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
        borderRadius: 20,
    },
    ruleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    ruleNameInput: {
        flex: 1,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 18,
        borderBottomWidth: 1,
        paddingVertical: 8,
        marginRight: theme.spacing.lg,
    },
    percInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        width: 55,
        marginRight: theme.spacing.xs,
    },
    percInput: {
        flex: 1,
        textAlign: 'right',
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 18,
        paddingVertical: 8,
    },
    iconBtn: {
        padding: 8,
    },
    ruleOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    protectionToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    addSubBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
    },
    addSubText: {
        marginLeft: 6,
        fontFamily: theme.typography.fontFamily.medium,
    },
    subRuleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.sm,
        paddingLeft: theme.spacing.md,
    },
    subRuleIndent: {
        width: 12,
        height: 1,
        marginRight: 12,
    },
    subRuleNameInput: {
        flex: 1,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 14,
        paddingVertical: 4,
        marginRight: 8,
    },
    subPercInput: {
        flex: 1,
        textAlign: 'right',
        fontSize: 14,
        paddingVertical: 4,
    },
    addMainBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        padding: theme.spacing.xl,
        borderRadius: 20,
        marginTop: theme.spacing.md,
    },
    addMainText: {
        marginLeft: theme.spacing.md,
        fontFamily: theme.typography.fontFamily.medium,
    },
    saveBtn: {
        marginTop: theme.spacing.xl,
        height: 60,
        borderRadius: 20,
    },
});
