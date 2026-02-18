import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryRow } from '../../components/CategoryRow';
import { EntryTransition } from '../../components/EntryTransition';
import { PressableScale } from '../../components/PressableScale';
import { theme } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { calculateAllocation, formatCurrency } from '../../services/allocation';

export default function Disburser() {
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [step, setStep] = useState<'input' | 'preview'>('input');
    const { categories, addIncome } = useApp();
    const insets = useSafeAreaInsets();

    const incomeAmount = parseFloat(amount) || 0;
    const allocation = calculateAllocation(incomeAmount, categories);

    const handleNext = () => {
        if (incomeAmount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid income amount.');
            return;
        }
        if (!name.trim()) {
            Alert.alert('Name Required', 'Please enter a name for this allocation.');
            return;
        }
        setStep('preview');
    };

    const handleConfirm = async () => {
        try {
            await addIncome(incomeAmount, name, description);
            setAmount('');
            setName('');
            setDescription('');
            setStep('input');
            Alert.alert('Success', 'Income allocated successfully.');
        } catch (error) {
            Alert.alert('Error', 'Failed to allocate income.');
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.content,
                { paddingTop: insets.top + theme.spacing.lg, paddingBottom: insets.bottom + 100 }
            ]}
        >
            <EntryTransition delay={100}>
                <Text style={styles.label}>Allocation Name</Text>
                <TextInput
                    style={styles.nameInput}
                    placeholder="e.g. Feb Salary"
                    placeholderTextColor={theme.colors.gray.medium}
                    value={name}
                    onChangeText={setName}
                    editable={step === 'input'}
                />

                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                    style={styles.descInput}
                    placeholder="Add details..."
                    placeholderTextColor={theme.colors.gray.medium}
                    value={description}
                    onChangeText={setDescription}
                    editable={step === 'input'}
                    multiline
                />

                <Text style={styles.label}>Income Amount</Text>
                <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={theme.colors.gray.medium}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    editable={step === 'input'}
                />
            </EntryTransition>

            {step === 'preview' ? (
                <EntryTransition delay={200}>
                    <Text style={styles.sectionTitle}>Preview Allocation</Text>
                    <View style={styles.previewCard}>
                        {allocation.map(item => (
                            <React.Fragment key={item.categoryId}>
                                <CategoryRow
                                    name={item.name}
                                    percentage={item.percentage}
                                    onPress={() => { }} // dummy to show it's clickable-ish or just styled
                                    rightElement={<Text style={styles.amountText}>{formatCurrency(item.amount)}</Text>}
                                />
                                {item.subAllocations?.map(sub => (
                                    <CategoryRow
                                        key={sub.categoryId}
                                        name={sub.name}
                                        percentage={sub.percentage}
                                        level={1}
                                        onPress={() => { }}
                                        rightElement={<Text style={styles.subAmountText}>{formatCurrency(sub.amount)}</Text>}
                                    />
                                ))}
                            </React.Fragment>
                        ))}
                    </View>

                    <PressableScale
                        style={styles.button}
                        onPress={handleConfirm}
                    >
                        <Text style={styles.buttonText}>Confirm & Save</Text>
                    </PressableScale>

                    <PressableScale
                        style={styles.backButton}
                        onPress={() => setStep('input')}
                    >
                        <Text style={styles.backButtonText}>Edit Amount</Text>
                    </PressableScale>
                </EntryTransition>
            ) : null}

            {step === 'input' ? (
                <EntryTransition delay={200}>
                    <PressableScale
                        style={[styles.button, incomeAmount <= 0 ? styles.buttonDisabled : undefined]}
                        onPress={handleNext}
                        disabled={incomeAmount <= 0}
                    >
                        <Text style={styles.buttonText}>Preview Allocation</Text>
                    </PressableScale>
                </EntryTransition>
            ) : null}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.lg,
    },
    label: {
        fontSize: theme.typography.size.sm,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: theme.spacing.sm,
    },
    nameInput: {
        fontSize: theme.typography.size.lg,
        fontWeight: theme.typography.weight.medium as any,
        color: theme.colors.text,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingBottom: theme.spacing.xs,
        marginBottom: theme.spacing.lg,
    },
    descInput: {
        fontSize: theme.typography.size.sm,
        color: theme.colors.text,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingBottom: theme.spacing.xs,
        marginBottom: theme.spacing.lg,
        minHeight: 40,
    },
    input: {
        fontSize: 48,
        fontWeight: theme.typography.weight.bold as any,
        color: theme.colors.text,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.black,
        paddingBottom: theme.spacing.sm,
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: theme.typography.size.sm,
        fontWeight: theme.typography.weight.bold as any,
        color: theme.colors.text,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: theme.spacing.md,
    },
    previewCard: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.roundness.md,
        overflow: 'hidden',
        marginBottom: theme.spacing.xxl,
    },
    amountText: {
        fontSize: theme.typography.size.md,
        fontWeight: theme.typography.weight.bold as any,
    },
    subAmountText: {
        fontSize: theme.typography.size.sm,
        color: theme.colors.textSecondary,
    },
    button: {
        backgroundColor: theme.colors.black,
        padding: theme.spacing.lg,
        alignItems: 'center',
        borderRadius: theme.roundness.md,
    },
    buttonDisabled: {
        backgroundColor: theme.colors.gray.medium,
    },
    buttonText: {
        color: theme.colors.white,
        fontSize: theme.typography.size.md,
        fontWeight: theme.typography.weight.bold as any,
    },
    backButton: {
        padding: theme.spacing.md,
        alignItems: 'center',
        marginTop: theme.spacing.sm,
    },
    backButtonText: {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.size.sm,
    },
});
