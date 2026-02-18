import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EntryTransition } from '../../components/EntryTransition';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { TransactionItem } from '../../components/TransactionItem';
import { theme } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function History() {
    const { transactions, categories, isLoading } = useApp();
    const insets = useSafeAreaInsets();

    if (isLoading) {
        return (
            <View style={styles.container}>
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
        <View style={styles.container}>
            <FlatList
                data={transactions}
                keyExtractor={item => item.id}
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: insets.top + theme.spacing.md, paddingBottom: insets.bottom + 80 }
                ]}
                ListHeaderComponent={
                    <EntryTransition delay={0}>
                        <Text style={styles.title}>History</Text>
                    </EntryTransition>
                }
                renderItem={({ item, index }) => (
                    <EntryTransition delay={index * 50}>
                        <TransactionItem
                            type={item.type}
                            amount={item.amount}
                            categoryName={getCategoryName(item.category_id)}
                            name={item.name}
                            description={item.description}
                            date={item.created_at}
                        />
                    </EntryTransition>
                )}
                ListEmptyComponent={
                    <View style={[styles.empty, { paddingTop: 100 + insets.top }]}>
                        <Text style={styles.emptyText}>No history yet.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
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
        fontSize: theme.typography.size.xxl,
        fontWeight: theme.typography.weight.bold as any,
        color: theme.colors.text,
        marginBottom: theme.spacing.lg,
    },
    emptyText: {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.size.md,
    },
});
