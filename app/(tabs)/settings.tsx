import * as Crypto from 'expo-crypto';
import { ChevronRight, Database, Info, Layout, Lock, Moon, Plus, Save, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EntryTransition } from '../../components/EntryTransition';
import { PressableScale } from '../../components/PressableScale';
import { theme } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Category } from '../../services/database';

export default function Settings() {
    const { categories, updateCategories, deleteCategory, isLoading } = useApp();
    const [localCategories, setLocalCategories] = useState<Category[]>([]);
    const [isModified, setIsModified] = useState(false);
    const insets = useSafeAreaInsets();

    // Toggles state
    const [darkMode, setDarkMode] = useState(false);
    const [biometrics, setBiometrics] = useState(false);
    const [showRulesEditor, setShowRulesEditor] = useState(false);

    useEffect(() => {
        if (categories.length > 0) {
            setLocalCategories(JSON.parse(JSON.stringify(categories)));
        }
    }, [categories]);


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
            name: 'New Category',
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
        } catch (error: any) {
            Alert.alert('Cannot Delete', error.message);
        }
    };

    const handleSave = async () => {
        const mainTotal = calculateTotal(null);
        if (Math.abs(mainTotal - 100) > 0.01) {
            Alert.alert('Invalid Percentages', `Main categories must sum to 100% (Current: ${mainTotal}%)`);
            return;
        }

        const mainsWithSubs = localCategories.filter(c =>
            localCategories.some(sub => sub.parent_id === c.id)
        );
        for (const main of mainsWithSubs) {
            const subTotal = calculateTotal(main.id);
            if (Math.abs(subTotal - 100) > 0.01) {
                Alert.alert('Invalid Sub-Percentages', `${main.name} subcategories must sum to 100% (Current: ${subTotal}%)`);
                return;
            }
        }

        try {
            await updateCategories(localCategories);
            setIsModified(false);
            Alert.alert('Success', 'Rules updated successfully.');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    if (isLoading) return null;

    const mainCategories = localCategories.filter(c => c.type === 'main');

    const SettingItem = ({ icon: Icon, label, value, onToggle, type = 'toggle' }: any) => (
        <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
                <View style={styles.iconBox}>
                    <Icon size={18} color={theme.colors.black} />
                </View>
                <Text style={styles.settingLabel}>{label}</Text>
            </View>
            {type === 'toggle' ? (
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: theme.colors.border, true: theme.colors.black }}
                    thumbColor={theme.colors.white}
                />
            ) : (
                <ChevronRight size={18} color={theme.colors.gray.medium} />
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: insets.top + theme.spacing.lg, paddingBottom: insets.bottom + 140 }
                ]}
            >
                <EntryTransition delay={0}>
                    <Text style={styles.title}>Settings</Text>
                </EntryTransition>

                <Text style={styles.sectionHeader}>Appearance</Text>
                <View style={styles.sectionCard}>
                    <SettingItem
                        icon={Moon}
                        label="Dark Mode"
                        value={darkMode}
                        onToggle={() => setDarkMode(!darkMode)}
                    />
                    <View style={styles.itemSeparator} />
                    <SettingItem
                        icon={Layout}
                        label="Minimalist View"
                        value={true}
                        onToggle={() => { }}
                    />
                </View>

                <Text style={styles.sectionHeader}>Security</Text>
                <View style={styles.sectionCard}>
                    <SettingItem
                        icon={Lock}
                        label="Biometric Lock"
                        value={biometrics}
                        onToggle={() => setBiometrics(!biometrics)}
                    />
                </View>

                <Text style={styles.sectionHeader}>Configuration</Text>
                <View style={styles.sectionCard}>
                    <PressableScale onPress={() => setShowRulesEditor(!showRulesEditor)}>
                        <SettingItem
                            icon={Database}
                            label="Allocation Rules"
                            type="chevron"
                        />
                    </PressableScale>
                </View>

                {showRulesEditor && (
                    <View style={styles.rulesEditorContainer}>
                        <View style={styles.headerRow}>
                            <Text style={styles.sectionTitle}>Main Categories</Text>
                            <Text style={[styles.total, Math.abs(calculateTotal(null) - 100) > 0.01 ? styles.totalError : undefined]}>
                                Total: {calculateTotal(null)}%
                            </Text>
                        </View>

                        {mainCategories.map(cat => (
                            <View key={cat.id} style={styles.categoryBlock}>
                                <View style={styles.catRow}>
                                    <TextInput
                                        style={styles.nameInput}
                                        value={cat.name}
                                        onChangeText={(val) => handleUpdateName(cat.id, val)}
                                    />
                                    <View style={styles.percentageWrapper}>
                                        <TextInput
                                            style={styles.percentageInput}
                                            value={cat.percentage.toString()}
                                            onChangeText={(val) => handleUpdatePercentage(cat.id, val)}
                                            keyboardType="numeric"
                                        />
                                        <Text>%</Text>
                                    </View>
                                    <PressableScale onPress={() => handleDelete(cat.id)} style={styles.deleteBtn}>
                                        <Trash2 size={18} color={theme.colors.gray.medium} />
                                    </PressableScale>
                                </View>

                                <View style={styles.optionsRow}>
                                    <View style={styles.option}>
                                        <Text style={styles.optionLabel}>Protected (Income Only)</Text>
                                        <Switch
                                            value={!!cat.is_protected}
                                            onValueChange={() => handleToggleProtected(cat.id)}
                                            trackColor={{ false: theme.colors.border, true: theme.colors.black }}
                                        />
                                    </View>
                                    <PressableScale style={styles.addSubBtn} onPress={() => handleAddCategory(cat.id)}>
                                        <Plus size={14} color={theme.colors.black} />
                                        <Text style={styles.addSubText}>Add Subcategory</Text>
                                    </PressableScale>
                                </View>

                                {localCategories.filter(s => s.parent_id === cat.id).map(sub => (
                                    <View key={sub.id} style={styles.subCatRow}>
                                        <View style={styles.indent} />
                                        <TextInput
                                            style={[styles.nameInput, styles.subNameInput]}
                                            value={sub.name}
                                            onChangeText={(val) => handleUpdateName(sub.id, val)}
                                        />
                                        <View style={styles.percentageWrapper}>
                                            <TextInput
                                                style={styles.percentageInput}
                                                value={sub.percentage.toString()}
                                                onChangeText={(val) => handleUpdatePercentage(sub.id, val)}
                                                keyboardType="numeric"
                                            />
                                            <Text>%</Text>
                                        </View>
                                        <PressableScale onPress={() => handleDelete(sub.id)} style={styles.deleteBtn}>
                                            <Trash2 size={16} color={theme.colors.gray.medium} />
                                        </PressableScale>
                                    </View>
                                ))}
                                {localCategories.some(s => s.parent_id === cat.id) && (
                                    <Text style={[styles.subTotal, Math.abs(calculateTotal(cat.id) - 100) > 0.01 ? styles.totalError : undefined]}>
                                        Sub-total: {calculateTotal(cat.id)}%
                                    </Text>
                                )}
                            </View>
                        ))}

                        <PressableScale style={styles.addMainBtn} onPress={() => handleAddCategory(null)}>
                            <Plus size={20} color={theme.colors.black} />
                            <Text style={styles.addMainText}>Add Main Category</Text>
                        </PressableScale>
                    </View>
                )}

                <Text style={styles.sectionHeader}>About</Text>
                <View style={styles.sectionCard}>
                    <SettingItem icon={Info} label="Version" value="1.0.2" type="text" />
                    <View style={styles.itemSeparator} />
                    <Text style={styles.versionText}>Designed for financial discipline.</Text>
                </View>

            </ScrollView>

            {isModified && (
                <View style={[styles.footer, { bottom: insets.bottom + 50, paddingBottom: insets.bottom > 0 ? insets.bottom : theme.spacing.lg }]}>
                    <PressableScale style={styles.saveBtn} onPress={handleSave}>
                        <Save size={20} color={theme.colors.white} />
                        <Text style={styles.saveBtnText}>Save Rules</Text>
                    </PressableScale>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.lg,
        paddingBottom: 100,
    },
    title: {
        fontSize: theme.typography.size.xxl,
        fontWeight: theme.typography.weight.bold as any,
        color: theme.colors.text,
        marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
        fontSize: theme.typography.size.xs,
        fontWeight: theme.typography.weight.bold as any,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: theme.spacing.sm,
        marginTop: theme.spacing.xl,
    },
    sectionCard: {
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.roundness.md,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: theme.colors.gray.light,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    settingLabel: {
        fontSize: theme.typography.size.md,
        color: theme.colors.text,
        fontWeight: theme.typography.weight.medium as any,
    },
    itemSeparator: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginLeft: theme.spacing.xl + 24,
    },
    rulesEditorContainer: {
        marginTop: theme.spacing.md,
        paddingLeft: theme.spacing.sm,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.typography.size.sm,
        fontWeight: theme.typography.weight.bold as any,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    total: {
        fontSize: theme.typography.size.sm,
        fontWeight: theme.typography.weight.bold as any,
    },
    totalError: {
        color: '#FF0000',
    },
    categoryBlock: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.roundness.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        backgroundColor: theme.colors.white,
    },
    catRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    nameInput: {
        flex: 1,
        fontSize: theme.typography.size.md,
        fontWeight: theme.typography.weight.bold as any,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingVertical: 4,
        marginRight: theme.spacing.md,
    },
    subNameInput: {
        fontWeight: theme.typography.weight.regular as any,
        fontSize: theme.typography.size.sm,
    },
    percentageWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        width: 60,
        marginRight: theme.spacing.sm,
    },
    percentageInput: {
        flex: 1,
        textAlign: 'right',
        fontSize: theme.typography.size.md,
        paddingVertical: 4,
    },
    deleteBtn: {
        padding: 6,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: theme.spacing.sm,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionLabel: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        marginRight: theme.spacing.sm,
    },
    addSubBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.gray.light,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
        borderRadius: theme.roundness.sm,
    },
    addSubText: {
        fontSize: 10,
        marginLeft: 4,
    },
    subCatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.sm,
        paddingLeft: theme.spacing.md,
    },
    indent: {
        width: 15,
        height: 1,
        backgroundColor: theme.colors.border,
        marginRight: theme.spacing.sm,
    },
    subTotal: {
        fontSize: 10,
        textAlign: 'right',
        marginTop: theme.spacing.xs,
        color: theme.colors.textSecondary,
    },
    addMainBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: theme.colors.black,
        padding: theme.spacing.md,
        borderRadius: theme.roundness.md,
        marginTop: theme.spacing.md,
    },
    addMainText: {
        marginLeft: theme.spacing.sm,
        fontWeight: theme.typography.weight.bold as any,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        padding: theme.spacing.lg,
    },
    saveBtn: {
        backgroundColor: theme.colors.black,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        borderRadius: theme.roundness.md,
    },
    saveBtnText: {
        color: theme.colors.white,
        fontWeight: theme.typography.weight.bold as any,
        marginLeft: theme.spacing.sm,
    },
    versionText: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        padding: theme.spacing.md,
        textAlign: 'center',
    },
});
