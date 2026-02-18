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
            style={[styles.container, level > 0 ? styles.containerSub : undefined]}
        >
            <View style={styles.left}>
                {level > 0 ? <View style={styles.indent} /> : null}
                <Text style={[styles.name, level > 0 ? styles.nameSub : undefined]}>{name}</Text>
                {isProtected ? <Lock size={14} color={theme.colors.gray.medium} style={styles.icon} /> : null}
            </View>
            <View style={styles.right}>
                {rightElement ? rightElement : (
                    <View style={styles.percentageContainer}>
                        <Text style={styles.percentage}>{percentage}%</Text>
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
        borderBottomColor: theme.colors.border,
    },
    containerSub: {
        backgroundColor: theme.colors.gray.light,
        borderBottomColor: theme.colors.white,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    indent: {
        width: 20,
        height: 1,
        backgroundColor: theme.colors.border,
        marginRight: theme.spacing.sm,
    },
    name: {
        fontSize: theme.typography.size.md,
        fontWeight: theme.typography.weight.medium as any,
        color: theme.colors.text,
    },
    nameSub: {
        fontSize: theme.typography.size.sm,
        color: theme.colors.textSecondary,
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
        color: theme.colors.textSecondary,
        marginRight: theme.spacing.xs,
    },
});
