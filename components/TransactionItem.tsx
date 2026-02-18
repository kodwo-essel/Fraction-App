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
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                {isIncome ? (
                    <TrendingUp size={20} color={theme.colors.black} />
                ) : (
                    <TrendingDown size={20} color={theme.colors.gray.medium} />
                )}
            </View>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.mainInfo}>
                        <Text style={styles.name}>{name}</Text>
                        <Text style={styles.category}>{categoryName}</Text>
                    </View>
                    <Text style={[styles.amount, !isIncome && styles.amountExpense]}>
                        {isIncome ? '+' : '-'}{formatCurrency(amount)}
                    </Text>
                </View>
                {description ? <Text style={styles.description}>{description}</Text> : null}
                <Text style={styles.date}>{new Date(date).toLocaleDateString()} • {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
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
        borderBottomColor: theme.colors.border,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.gray.light,
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
        color: theme.colors.text,
    },
    category: {
        fontSize: theme.typography.size.xs,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    amount: {
        fontSize: theme.typography.size.md,
        fontWeight: theme.typography.weight.bold as any,
        color: theme.colors.text,
        marginLeft: theme.spacing.sm,
    },
    amountExpense: {
        fontWeight: theme.typography.weight.regular as any,
        color: theme.colors.textSecondary,
    },
    description: {
        fontSize: theme.typography.size.sm,
        color: theme.colors.textSecondary,
        marginTop: 2,
        marginBottom: 4,
    },
    date: {
        fontSize: theme.typography.size.xs,
        color: theme.colors.textSecondary,
    },
});
