import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryRow } from '../../components/CategoryRow';
import { EntryTransition } from '../../components/EntryTransition';
import { PressableScale } from '../../components/PressableScale';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { Button, Card, Text } from '../../components/Themed';
import CURRENCIES from '../../constants/currencies.json';
import { useAlert } from '../../context/AlertContext';
import { useApp } from '../../context/AppContext';
import { calculateAllocation, formatCompact, formatCurrency } from '../../services/allocation';

export default function Disburser() {
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [step, setStep] = useState<'input' | 'preview'>('input');
    const { categories, addIncome, isLoading, currencyCode, theme, themeMode } = useApp();
    const { showAlert } = useAlert();
    const insets = useSafeAreaInsets();

    const styles = getStyles(theme, themeMode);
    const incomeAmount = parseFloat(amount) || 0;

    const activeCurrency = React.useMemo(() =>
        CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES.find(c => c.code === 'GHS') || CURRENCIES[0]
        , [currencyCode]);

    const allocation = React.useMemo(() => calculateAllocation(incomeAmount, categories), [incomeAmount, categories]);

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.content, { paddingTop: insets.top + theme.spacing.lg }]}>
                    <SkeletonLoader height={24} width={120} style={{ marginBottom: 15 }} />
                    <SkeletonLoader height={50} style={{ marginBottom: 25 }} />
                    <SkeletonLoader height={24} width={120} style={{ marginBottom: 15 }} />
                    <SkeletonLoader height={50} style={{ marginBottom: 25 }} />
                    <SkeletonLoader height={24} width={120} style={{ marginBottom: 15 }} />
                    <SkeletonLoader height={70} style={{ marginBottom: 25 }} />
                </View>
            </View>
        );
    }

    const handleNext = () => {
        if (incomeAmount <= 0) {
            showAlert({ title: 'Invalid Amount', message: 'Please enter a valid income amount.' });
            return;
        }
        if (!name.trim()) {
            showAlert({ title: 'Name Required', message: 'Please enter a name for this allocation.' });
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
            showAlert({ title: 'Success', message: 'Income allocated successfully.' });
        } catch (error) {
            showAlert({ title: 'Error', message: 'Failed to allocate income.' });
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
                    <View style={styles.header}>
                        <Text variant="h1" style={styles.title}>Disburser</Text>
                        <Card style={styles.iconContainer}>
                            <Ionicons name="cash-outline" size={22} color={theme.colors.text} />
                        </Card>
                    </View>
                </EntryTransition>

                <EntryTransition delay={150}>
                    <Card style={styles.inputCard}>
                        <Text variant="label" style={styles.label}>Allocation Details</Text>

                        <TextInput
                            style={[styles.nameInput, { color: theme.colors.text, borderBottomColor: theme.colors.border }]}
                            placeholder="Allocation Name (e.g. Feb Salary)"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={name}
                            onChangeText={setName}
                            editable={step === 'input'}
                            selectionColor={theme.colors.primary}
                        />

                        <TextInput
                            style={[styles.descInput, { color: theme.colors.text }]}
                            placeholder="Optional Details..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={description}
                            onChangeText={setDescription}
                            editable={step === 'input'}
                            multiline
                            selectionColor={theme.colors.primary}
                        />

                        <View style={[styles.amountContainer, { borderBottomColor: incomeAmount > 0 ? theme.colors.success : theme.colors.border }]}>
                            <View style={[
                                styles.currencySymbolBox,
                                activeCurrency.symbol.length > 2 && { minWidth: 60, paddingHorizontal: 8 }
                            ]}>
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.symbolText,
                                        { fontSize: 24, lineHeight: 24, transform: [{ translateY: 2 }], color: incomeAmount > 0 ? theme.colors.success : theme.colors.primary },
                                        activeCurrency.symbol.length === 2 && { fontSize: 22, lineHeight: 22 },
                                        activeCurrency.symbol.length === 3 && { fontSize: 20, lineHeight: 20 },
                                        activeCurrency.symbol.length > 3 && { fontSize: 16, lineHeight: 16 }
                                    ]}
                                >
                                    {activeCurrency.symbol}
                                </Text>
                            </View>
                            <TextInput
                                style={[styles.input, { color: incomeAmount > 0 ? theme.colors.success : theme.colors.text }]}
                                placeholder="0.00"
                                placeholderTextColor={theme.colors.border}
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                                editable={step === 'input'}
                                selectionColor={theme.colors.success}
                            />
                        </View>
                    </Card>
                </EntryTransition>

                {step === 'preview' ? (
                    <EntryTransition delay={200}>
                        <View style={styles.sectionHeader}>
                            <Text variant="label">Preview Distribution</Text>
                        </View>
                        <Card
                            gradient
                            gradientColors={themeMode === 'light' ? ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.05)'] : ['rgba(255, 255, 255, 0.05)', 'rgba(0, 0, 0, 0.1)']}
                            style={styles.previewCard}
                        >
                            {allocation.map((item, idx) => (
                                <React.Fragment key={item.categoryId}>
                                    <CategoryRow
                                        name={item.name}
                                        percentage={item.percentage}
                                        rightElement={
                                            <Text variant="h3" style={[styles.amountText, { color: theme.colors.success }]}>
                                                {formatCompact(item.amount, currencyCode)}
                                            </Text>
                                        }
                                    />
                                    {item.subAllocations?.map(sub => (
                                        <CategoryRow
                                            key={sub.categoryId}
                                            name={sub.name}
                                            percentage={sub.percentage}
                                            level={1}
                                            rightElement={
                                                <Text variant="caption" color="textSecondary">
                                                    {formatCompact(sub.amount, currencyCode)}
                                                </Text>
                                            }
                                        />
                                    ))}
                                </React.Fragment>
                            ))}
                        </Card>

                        <Button
                            title="Confirm & Disburse"
                            variant="primary"
                            onPress={handleConfirm}
                            style={styles.button}
                        />

                        <PressableScale
                            style={styles.backButton}
                            onPress={() => setStep('input')}
                        >
                            <Text variant="label" color="textSecondary">Edit Amount</Text>
                        </PressableScale>
                    </EntryTransition>
                ) : (
                    <EntryTransition delay={200}>
                        <Button
                            title="Preview Allocation"
                            variant="primary"
                            onPress={handleNext}
                            disabled={incomeAmount <= 0}
                            style={[
                                styles.button,
                                incomeAmount <= 0 && { opacity: 0.5 }
                            ]}
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
        paddingHorizontal: theme.spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    title: {
        letterSpacing: -1.5,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: theme.colors.border,
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
        backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
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
    previewCard: {
        padding: 0,
        overflow: 'hidden',
        marginBottom: theme.spacing.xxl,
    },
    amountText: {
        letterSpacing: -0.5,
    },
    button: {
        marginTop: theme.spacing.md,
    },
    backButton: {
        padding: theme.spacing.md,
        alignItems: 'center',
        marginTop: theme.spacing.sm,
    },
});
