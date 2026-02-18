import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { formatCurrency } from '../services/allocation';

interface BalanceCardProps {
    label: string;
    amount: number;
    subText?: string;
    large?: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ label, amount, subText, large }) => {
    return (
        <View style={[
            styles.container,
            { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
            large ? [styles.containerLarge, { backgroundColor: theme.colors.text }] : undefined
        ]}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
            <Text style={[
                styles.amount,
                { color: theme.colors.text },
                large ? { color: theme.colors.background } : undefined
            ]}>
                {formatCurrency(amount)}
            </Text>
            {subText ? <Text style={[styles.subText, { color: theme.colors.textSecondary }]}>{subText}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        padding: theme.spacing.md,
        borderRadius: theme.roundness.md,
        marginBottom: theme.spacing.md,
    },
    containerLarge: {
        padding: theme.spacing.lg,
        borderWidth: 0,
    },
    label: {
        fontSize: theme.typography.size.sm,
        marginBottom: theme.spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    amount: {
        fontSize: theme.typography.size.xl,
        fontWeight: theme.typography.weight.bold as any,
    },
    subText: {
        fontSize: theme.typography.size.xs,
        marginTop: theme.spacing.xs,
    },
});
