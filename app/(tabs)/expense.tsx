import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryRow } from '../../components/CategoryRow';
import { EntryTransition } from '../../components/EntryTransition';
import { PressableScale } from '../../components/PressableScale';
import { theme } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/allocation';

export default function Expense() {
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { categories, addExpense, getCategoryBalance, isLoading } = useApp();
    const insets = useSafeAreaInsets();

    const expenseAmount = parseFloat(amount) || 0;

    // Can only log expenses to non-protected categories
    // If a category has subcategories, must choose subcategory
    const selectableCategories = categories.filter(c => {
        if (c.is_protected) return false;
        const hasSubs = categories.some(sub => sub.parent_id === c.id);
        if (hasSubs && c.type === 'main') return false; // Must pick sub
        return true;
    });

    const handleSave = async () => {
        if (expenseAmount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid expense amount.');
            return;
        }
        if (!name.trim()) {
            Alert.alert('Name Required', 'Please enter a name for this expense.');
            return;
        }
        if (!selectedId) {
            Alert.alert('Category Required', 'Please select a category for this expense.');
            return;
        }

        try {
            await addExpense(selectedId, expenseAmount, name, description);
            setAmount('');
            setName('');
            setDescription('');
            setSelectedId(null);
            Alert.alert('Success', 'Expense logged successfully.');
        } catch (error) {
            Alert.alert('Error', 'Failed to log expense.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: insets.top + theme.spacing.lg, paddingBottom: insets.bottom + 100 }
                ]}
            >
                <EntryTransition delay={100}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Expense Name</Text>
                    <TextInput
                        style={[styles.nameInput, { color: theme.colors.text, borderBottomColor: theme.colors.border }]}
                        placeholder="e.g. Grocery"
                        placeholderTextColor={theme.colors.gray.medium}
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description (Optional)</Text>
                    <TextInput
                        style={[styles.descInput, { color: theme.colors.text, borderBottomColor: theme.colors.border }]}
                        placeholder="Add details..."
                        placeholderTextColor={theme.colors.gray.medium}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Expense Amount</Text>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text, borderBottomColor: theme.colors.text }]}
                        placeholder="0.00"
                        placeholderTextColor={theme.colors.gray.medium}
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                </EntryTransition>

                <EntryTransition delay={200}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select Category</Text>
                    <View style={[styles.listContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
                        {selectableCategories.map(cat => (
                            <CategoryRow
                                key={cat.id}
                                name={cat.name}
                                percentage={cat.percentage}
                                level={cat.type === 'sub' ? 1 : 0}
                                onPress={() => setSelectedId(cat.id)}
                                rightElement={
                                    <View style={styles.right}>
                                        <Text style={[styles.balance, { color: theme.colors.textSecondary }]}>{formatCurrency(getCategoryBalance(cat.id))}</Text>
                                        <View style={[
                                            styles.radio,
                                            { borderColor: theme.colors.text },
                                            selectedId === cat.id && [styles.radioSelected, { backgroundColor: theme.colors.text }]
                                        ]} />
                                    </View>
                                }
                            />
                        ))}
                    </View>
                </EntryTransition>

                <EntryTransition delay={300}>
                    <PressableScale
                        style={[
                            styles.button,
                            { backgroundColor: theme.colors.text },
                            (!selectedId || expenseAmount <= 0) ? [styles.buttonDisabled, { backgroundColor: theme.colors.gray.medium }] : undefined
                        ]}
                        onPress={handleSave}
                        disabled={!selectedId || expenseAmount <= 0}
                    >
                        <Text style={[styles.buttonText, { color: theme.colors.background }]}>Save Expense</Text>
                    </PressableScale>
                </EntryTransition>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: theme.spacing.lg,
    },
    label: {
        fontSize: theme.typography.size.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: theme.spacing.sm,
    },
    nameInput: {
        fontSize: theme.typography.size.lg,
        fontWeight: theme.typography.weight.medium as any,
        borderBottomWidth: 1,
        paddingBottom: theme.spacing.xs,
        marginBottom: theme.spacing.lg,
    },
    descInput: {
        fontSize: theme.typography.size.sm,
        borderBottomWidth: 1,
        paddingBottom: theme.spacing.xs,
        marginBottom: theme.spacing.lg,
        minHeight: 40,
    },
    input: {
        fontSize: 48,
        fontWeight: theme.typography.weight.bold as any,
        borderBottomWidth: 2,
        paddingBottom: theme.spacing.sm,
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: theme.typography.size.sm,
        fontWeight: theme.typography.weight.bold as any,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: theme.spacing.md,
    },
    listContainer: {
        borderWidth: 1,
        borderRadius: theme.roundness.md,
        overflow: 'hidden',
        marginBottom: theme.spacing.xxl,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    balance: {
        fontSize: theme.typography.size.xs,
        marginRight: theme.spacing.sm,
    },
    radio: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
    },
    radioSelected: {
    },
    button: {
        padding: theme.spacing.lg,
        alignItems: 'center',
        borderRadius: theme.roundness.md,
    },
    buttonDisabled: {
    },
    buttonText: {
        fontSize: theme.typography.size.md,
        fontWeight: theme.typography.weight.bold as any,
    },
});
