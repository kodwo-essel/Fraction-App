import React from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EntryTransition } from '../../components/EntryTransition';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { TransactionItem } from '../../components/TransactionItem';
import { theme } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function History() {
    const { transactions, categories, isLoading, deleteTransaction } = useApp();
    const insets = useSafeAreaInsets();

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Entry',
            'Are you sure you want to delete this record?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteTransaction(id)
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.content, { paddingTop: insets.top + theme.spacing.md }]}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <SkeletonLoader key={i} height={70} style={{ marginBottom: 15 }} borderRadius={theme.roundness.md} />
                    ))}
                </View>
            </View>
        );
    }

    const getCategoryName = (id: string) => {
        return categories.find(c => c.id === id)?.name || 'Unknown';
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={transactions}
                keyExtractor={item => item.id}
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: insets.top + theme.spacing.md, paddingBottom: insets.bottom + 80 }
                ]}
                ListHeaderComponent={
                    <EntryTransition delay={0}>
                        <Text style={[styles.title, { color: theme.colors.textSecondary }]}>History</Text>
                    </EntryTransition>
                }
                renderItem={({ item, index }) => (
                    <EntryTransition delay={index * 50}>
                        <TransactionItem
                            id={item.id}
                            type={item.type}
                            amount={item.amount}
                            categoryName={getCategoryName(item.category_id)}
                            name={item.name}
                            description={item.description}
                            date={item.created_at}
                            onDelete={handleDelete}
                        />
                    </EntryTransition>
                )}
                ListEmptyComponent={
                    <View style={[styles.empty, { paddingTop: 100 + insets.top }]}>
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No history yet.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
    },
    empty: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
    },
    title: {
        fontSize: theme.typography.size.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: theme.spacing.sm,
    },
    emptyText: {
        fontSize: theme.typography.size.md,
    },
});
