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
        <View style={[styles.container, large ? styles.containerLarge : undefined]}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.amount, large ? styles.amountLarge : undefined]}>{formatCurrency(amount)}</Text>
            {subText ? <Text style={styles.subText}>{subText}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
        borderRadius: theme.roundness.md,
        marginBottom: theme.spacing.md,
    },
    containerLarge: {
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.black,
    },
    label: {
        fontSize: theme.typography.size.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    amount: {
        fontSize: theme.typography.size.xl,
        fontWeight: theme.typography.weight.bold as any,
        color: theme.colors.text,
    },
    amountLarge: {
        fontSize: theme.typography.size.xxl,
        color: theme.colors.white,
    },
    subText: {
        fontSize: theme.typography.size.xs,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
});
