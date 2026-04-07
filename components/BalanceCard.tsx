import React from 'react';
import { StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../services/allocation';
import { Text, Card } from './Themed';

interface BalanceCardProps {
    label: string;
    amount: number;
    subText?: string;
    large?: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ label, amount, subText, large }) => {
    const { currencyCode, theme } = useApp();
    const styles = getStyles(theme);

    return (
        <Card style={styles.container}>
            <Text variant="label" color="textSecondary" style={styles.label}>{label}</Text>
            <Text 
              variant={large ? 'h1' : 'h2'} 
              style={[
                styles.amount,
                large && { fontSize: theme.typography.size.xxxl }
              ]}
            >
                {formatCurrency(amount, currencyCode)}
            </Text>
            {subText ? <Text variant="caption" color="textSecondary" style={styles.subText}>{subText}</Text> : null}
        </Card>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
    },
    label: {
        marginBottom: theme.spacing.xs,
    },
    amount: {
        letterSpacing: -1,
    },
    subText: {
        marginTop: theme.spacing.xs,
    },
});
