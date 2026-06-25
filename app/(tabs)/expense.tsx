import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryRow } from '../../components/CategoryRow';
import { EntryTransition } from '../../components/EntryTransition';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { Button, Card, Text } from '../../components/Themed';
import CURRENCIES from '../../constants/currencies.json';
import { useAlert } from '../../context/AlertContext';
import { useApp } from '../../context/AppContext';
import { formatCompact, formatCurrency } from '../../services/allocation';
import { GuideMessage } from '../../components/GuideMessage';

export default function Expense() {
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { categories, addExpense, getCategoryBalance, isLoading, currencyCode, theme } = useApp();
    const { showAlert } = useAlert();
    const insets = useSafeAreaInsets();

    const styles = getStyles(theme);
    const expenseAmount = parseFloat(amount) || 0;

    const activeCurrency = React.useMemo(() =>
        CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES.find(c => c.code === 'GHS') || CURRENCIES[0]
        , [currencyCode]);

    const selectableCategories = React.useMemo(() => {
        return categories.filter(c => {
            if (c.is_protected) return false;
            const hasSubs = categories.some(sub => sub.parent_id === c.id);
            if (hasSubs && c.type === 'main') return false;
            return true;
        });
    }, [categories]);

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.content, { paddingTop: insets.top + theme.spacing.lg }]}>
                    <SkeletonLoader height={24} width={120} style={{ marginBottom: 15 }} />
                    <SkeletonLoader height={50} style={{ marginBottom: 25 }} />
                    <SkeletonLoader height={24} width={120} style={{ marginBottom: 15 }} />
                    <SkeletonLoader height={200} style={{ marginBottom: 25 }} />
                </View>
            </View>
        );
    }

    const handleSave = async () => {
        if (expenseAmount <= 0) {
            showAlert({ title: 'Invalid Amount', message: 'Please enter a valid expense amount.' });
            return;
        }
        if (!name.trim()) {
            showAlert({ title: 'Name Required', message: 'Please enter a name for this expense.' });
            return;
        }
        if (!selectedId) {
            showAlert({ title: 'Category Required', message: 'Please select a category for this expense.' });
            return;
        }

        try {
            await addExpense(selectedId, expenseAmount, name, description);
            setAmount('');
            setName('');
            setDescription('');
            setSelectedId(null);
            showAlert({ title: 'Success', message: 'Expense logged successfully.' });
        } catch (error) {
            showAlert({ title: 'Error', message: 'Failed to log expense.' });
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: insets.top + theme.spacing.lg, paddingBottom: insets.bottom + 100 }
                ]}
            >
                <EntryTransition delay={100}>
                    <Card style={styles.inputCard}>
                        <Text variant="label" style={styles.label}>Log Expense</Text>

                        <TextInput
                            style={[styles.nameInput, { color: theme.colors.text, borderBottomColor: theme.colors.border }]}
                            placeholder="Expense Name (e.g. Uber)"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={name}
                            onChangeText={setName}
                            selectionColor={theme.colors.primary}
                        />

                        <TextInput
                            style={[styles.descInput, { color: theme.colors.text }]}
                            placeholder="Optional Details..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            selectionColor={theme.colors.primary}
                        />

                        <View style={[styles.amountContainer, { borderBottomColor: expenseAmount > 0 ? theme.colors.error : theme.colors.border }]}>
                            <View style={[
                                styles.currencySymbolBox,
                                activeCurrency.symbol.length > 2 && { minWidth: 60, paddingHorizontal: 8 }
                            ]}>
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.symbolText,
                                        { fontSize: 24, lineHeight: 24, transform: [{ translateY: 2 }], color: expenseAmount > 0 ? theme.colors.error : theme.colors.primary },
                                        activeCurrency.symbol.length === 2 && { fontSize: 22, lineHeight: 22 },
                                        activeCurrency.symbol.length === 3 && { fontSize: 20, lineHeight: 20 },
                                        activeCurrency.symbol.length > 3 && { fontSize: 16, lineHeight: 16 }
                                    ]}
                                >
                                    {activeCurrency.symbol}
                                </Text>
                            </View>
                            <TextInput
                                style={[styles.input, { color: expenseAmount > 0 ? theme.colors.error : theme.colors.text }]}
                                placeholder="0.00"
                                placeholderTextColor={theme.colors.border}
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                                selectionColor={theme.colors.error}
                            />
                        </View>
                    </Card>
                </EntryTransition>

                <EntryTransition delay={200}>
                    <View style={styles.sectionHeader}>
                        <Text variant="label">Select Destination</Text>
                    </View>
                    <Card style={styles.listCard}>
                        {selectableCategories.map(cat => (
                            <CategoryRow
                                key={cat.id}
                                name={cat.name}
                                percentage={cat.percentage}
                                level={cat.type === 'sub' ? 1 : 0}
                                onPress={() => setSelectedId(cat.id)}
                                rightElement={
                                    <View style={styles.right}>
                                        <Text variant="caption" color="textSecondary" style={styles.balance}>{formatCompact(getCategoryBalance(cat.id), currencyCode)}</Text>
                                        <View style={[
                                            styles.radio,
                                            { borderColor: theme.colors.border },
                                            selectedId === cat.id && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                        ]} />
                                    </View>
                                }
                            />
                        ))}
                    </Card>
                </EntryTransition>

                <EntryTransition delay={300}>
                    <Button
                        title="Record Transaction"
                        variant="primary"
                        onPress={handleSave}
                        disabled={!selectedId || expenseAmount <= 0}
                        style={[
                            styles.button,
                            (!selectedId || expenseAmount <= 0) && { opacity: 0.5 }
                        ]}
                    />
                </EntryTransition>
            </ScrollView>

            <GuideMessage situation="expense" />
        </View>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.lg,
    },
    inputCard: {
        marginBottom: theme.spacing.xl,
        padding: theme.spacing.xl,
    },
    label: {
        marginBottom: theme.spacing.md,
    },
    nameInput: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.size.lg,
        borderBottomWidth: 1,
        paddingBottom: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
    },
    descInput: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.size.sm,
        marginBottom: theme.spacing.xl,
        minHeight: 40,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        paddingBottom: theme.spacing.md,
        gap: theme.spacing.md,
    },
    currencySymbolBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    symbolText: {
        fontFamily: theme.typography.fontFamily.bold,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    input: {
        flex: 1,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 48,
        marginLeft: theme.spacing.xs,
        letterSpacing: -2,
    },
    sectionHeader: {
        marginBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.xs,
    },
    listCard: {
        padding: 0,
        overflow: 'hidden',
        marginBottom: theme.spacing.xxl,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    balance: {
        marginRight: theme.spacing.sm,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
    },
    button: {
        marginTop: theme.spacing.md,
    },
});
