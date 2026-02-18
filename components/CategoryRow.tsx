import { ChevronRight, Lock } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { PressableScale } from './PressableScale';

interface CategoryRowProps {
    name: string;
    percentage: number;
    isProtected?: boolean;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    level?: number;
}

export const CategoryRow: React.FC<CategoryRowProps> = ({
    name,
    percentage,
    isProtected,
    onPress,
    rightElement,
    level = 0
}) => {
    return (
        <PressableScale
            onPress={onPress}
            disabled={!onPress}
            style={[
                styles.container,
                { borderBottomColor: theme.colors.border },
                level > 0 ? [styles.containerSub, { backgroundColor: theme.colors.gray.light, borderBottomColor: theme.colors.background }] : undefined
            ]}
        >
            <View style={styles.left}>
                {level > 0 ? <View style={[styles.indent, { backgroundColor: theme.colors.border }]} /> : null}
                <Text style={[
                    styles.name,
                    { color: theme.colors.text },
                    level > 0 ? [styles.nameSub, { color: theme.colors.textSecondary }] : undefined
                ]}>
                    {name}
                </Text>
                {isProtected ? <Lock size={14} color={theme.colors.gray.medium} style={styles.icon} /> : null}
            </View>
            <View style={styles.right}>
                {rightElement ? rightElement : (
                    <View style={styles.percentageContainer}>
                        <Text style={[styles.percentage, { color: theme.colors.textSecondary }]}>{percentage}%</Text>
                        {onPress ? <ChevronRight size={18} color={theme.colors.border} /> : null}
                    </View>
                )}
            </View>
        </PressableScale>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        borderBottomWidth: 1,
    },
    containerSub: {
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    indent: {
        width: 20,
        height: 1,
        marginRight: theme.spacing.sm,
    },
    name: {
        fontSize: theme.typography.size.md,
        fontWeight: theme.typography.weight.medium as any,
    },
    nameSub: {
        fontSize: theme.typography.size.sm,
    },
    icon: {
        marginLeft: theme.spacing.xs,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    percentageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    percentage: {
        fontSize: theme.typography.size.md,
        marginRight: theme.spacing.xs,
    },
});
