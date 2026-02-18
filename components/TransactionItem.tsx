import { TrendingDown, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { formatCurrency } from '../services/allocation';

interface TransactionItemProps {
    type: 'income' | 'expense';
    amount: number;
    categoryName: string;
    name: string;
    description?: string;
    date: string;
    onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
    type,
    amount,
    categoryName,
    name,
    description,
    date,
    onPress
}) => {
    const isIncome = type === 'income';

    return (
        <View style={[styles.container, { borderBottomColor: theme.colors.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.gray.light }]}>
                {isIncome ? (
                    <TrendingUp size={20} color={theme.colors.text} />
                ) : (
                    <TrendingDown size={20} color={theme.colors.gray.medium} />
                )}
            </View>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.mainInfo}>
                        <Text style={[styles.name, { color: theme.colors.text }]}>{name}</Text>
                        <Text style={[styles.category, { color: theme.colors.textSecondary }]}>{categoryName}</Text>
                    </View>
                    <Text style={[
                        styles.amount,
                        { color: theme.colors.text },
                        !isIncome && [styles.amountExpense, { color: theme.colors.textSecondary }]
                    ]}>
                        {isIncome ? '+' : '-'}{formatCurrency(amount)}
                    </Text>
                </View>
                {description ? <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{description}</Text> : null}
                <Text style={[styles.date, { color: theme.colors.textSecondary }]}>{new Date(date).toLocaleDateString()} • {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    mainInfo: {
        flex: 1,
    },
    name: {
        fontSize: theme.typography.size.md,
        fontWeight: theme.typography.weight.bold as any,
    },
    category: {
        fontSize: theme.typography.size.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    amount: {
        fontSize: theme.typography.size.md,
        fontWeight: theme.typography.weight.bold as any,
        marginLeft: theme.spacing.sm,
    },
    amountExpense: {
        fontWeight: theme.typography.weight.regular as any,
    },
    description: {
        fontSize: theme.typography.size.sm,
        marginTop: 2,
        marginBottom: 4,
    },
    date: {
        fontSize: theme.typography.size.xs,
    },
});
