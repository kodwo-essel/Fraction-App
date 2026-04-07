import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '../../context/AlertContext';
import { EntryTransition } from '../../components/EntryTransition';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { TransactionItem } from '../../components/TransactionItem';
import { useApp } from '../../context/AppContext';
import { Text, Card } from '../../components/Themed';

export default function History() {
    const { transactions, categories, isLoading, deleteTransaction, theme, themeMode } = useApp();
    const { showAlert } = useAlert();
    const insets = useSafeAreaInsets();
    const styles = getStyles(theme, themeMode);

    const groupedTransactions = React.useMemo(() => {
        const groups: Record<string, any> = {};

        transactions.forEach(t => {
            if (!groups[t.group_id]) {
                groups[t.group_id] = {
                    ...t,
                    amount: t.total_amount || t.amount,
                    isGroup: t.type === 'income' && transactions.filter(x => x.group_id === t.group_id).length > 1
                };
            }
        });

        return Object.values(groups).sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }, [transactions]);

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.content, { paddingTop: insets.top + theme.spacing.md }]}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <SkeletonLoader key={i} height={80} style={{ marginBottom: 15 }} borderRadius={theme.roundness.md} />
                    ))}
                </View>
            </View>
        );
    }

    const handleDelete = (id: string, groupId?: string) => {
        showAlert({
            title: 'Delete Record',
            message: 'This action will permanently remove this entry from your ledger.',
            buttons: [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteTransaction(id, groupId)
                }
            ]
        });
    };

    const getCategoryName = (item: any) => {
        if (item.isGroup) return 'System Allocation';
        return categories.find(c => c.id === item.category_id)?.name || 'Uncategorized';
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={groupedTransactions}
                keyExtractor={(item: any) => item.group_id}
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: insets.top + theme.spacing.lg, paddingBottom: insets.bottom + 100 }
                ]}
                ListHeaderComponent={
                    <EntryTransition delay={100}>
                        <View style={styles.header}>
                            <Text variant="h1" style={styles.title}>Ledger</Text>
                            <Card style={styles.iconContainer}>
                                <Ionicons name="receipt-outline" size={24} color={theme.colors.text} />
                            </Card>
                        </View>
                    </EntryTransition>
                }
                renderItem={({ item, index }: { item: any; index: number }) => (
                    <EntryTransition delay={index * 50}>
                        <TransactionItem
                            id={item.id}
                            groupId={item.group_id}
                            type={item.type}
                            amount={item.amount}
                            categoryName={getCategoryName(item)}
                            name={item.name}
                            description={item.description}
                            date={item.created_at}
                            onDelete={handleDelete}
                        />
                    </EntryTransition>
                )}
                ListEmptyComponent={
                    <View style={[styles.empty, { paddingTop: 100 + insets.top }]}>
                        <Ionicons name="receipt-outline" size={56} color={theme.colors.border} />
                        <Text variant="h3" style={styles.emptyText}>Pristine Ledger</Text>
                        <Text variant="caption" color="textSecondary" style={styles.emptySubtext}>
                            Your financial journey hasn't started yet. Log a transaction to see it here.
                        </Text>
                    </View>
                }
            />
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
    },
    empty: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
        gap: theme.spacing.sm,
    },
    emptyText: {
        marginTop: theme.spacing.md,
    },
    emptySubtext: {
        textAlign: 'center',
        maxWidth: 240,
        lineHeight: 20,
    },
});
