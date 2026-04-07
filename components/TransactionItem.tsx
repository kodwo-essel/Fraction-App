import { ArrowDownRight, ArrowUpRight, Trash2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatCompact } from '../services/allocation';
import { PressableScale } from './PressableScale';
import { Text } from './Themed';

interface TransactionItemProps {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    categoryName: string;
    name: string;
    description?: string;
    date: string;
    onDelete?: (id: string, groupId?: string) => void;
    onPress?: () => void;
    groupId?: string;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
    id,
    type,
    amount,
    categoryName,
    name,
    description,
    date,
    onDelete,
    onPress,
    groupId
}) => {
    const { currencyCode, theme, themeMode } = useApp();
    const isIncome = type === 'income';
    const styles = getStyles(theme, themeMode);

    return (
        <PressableScale
            disabled={!onPress}
            onPress={onPress}
            style={styles.container}
        >
            <View style={styles.iconContainer}>
                {isIncome ? (
                    <ArrowUpRight size={18} color={theme.colors.success} />
                ) : (
                    <ArrowDownRight size={18} color={theme.colors.error} />
                )}
            </View>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.mainInfo}>
                        <Text variant="body" style={styles.name}>{name}</Text>
                        <Text variant="caption" color="textSecondary" style={styles.category}>{categoryName}</Text>
                    </View>
                    <View style={styles.rightContent}>
                        <Text
                            variant="h3"
                            style={[styles.amount, { color: isIncome ? theme.colors.success : theme.colors.error }]}
                        >
                            {isIncome ? '+' : '-'}{formatCompact(amount, currencyCode)}
                        </Text>
                        {onDelete && (
                            <PressableScale
                                style={styles.deleteButton}
                                onPress={() => onDelete(id, groupId)}
                            >
                                <Trash2 size={16} color={theme.colors.text} />
                            </PressableScale>
                        )}
                    </View>
                </View>
                {description ? (
                    <Text variant="caption" color="textSecondary" style={styles.description}>
                        {description}
                    </Text>
                ) : null}
                <View style={styles.footer}>
                    <Text variant="caption" color="textSecondary" style={styles.date}>
                        {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {onPress && (
                        <View style={styles.chevronContainer}>
                            <ArrowUpRight size={12} color={theme.colors.textSecondary} style={{ transform: [{ rotate: '45deg' }] }} />
                        </View>
                    )}
                </View>
            </View>
        </PressableScale>
    );
};

const getStyles = (theme: any, mode: string) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
        backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255, 255, 255, 0.05)',
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
        fontFamily: theme.typography.fontFamily.medium,
    },
    category: {
        marginTop: 1,
    },
    amount: {
        marginLeft: theme.spacing.sm,
        letterSpacing: -0.5,
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteButton: {
        marginLeft: theme.spacing.md,
        padding: theme.spacing.xs,
        opacity: 0.6,
    },
    description: {
        marginTop: 4,
        marginBottom: 4,
        fontStyle: 'italic',
    },
    date: {
        opacity: 0.8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
    },
    chevronContainer: {
        opacity: 0.4,
    },
});
