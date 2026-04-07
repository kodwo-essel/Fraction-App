import { ChevronRight, Lock } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { PressableScale } from './PressableScale';
import { Text } from './Themed';

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
    const { theme, themeMode } = useApp();
    const styles = getStyles(theme, themeMode);

    return (
        <PressableScale
            onPress={onPress}
            disabled={!onPress}
            style={[
                styles.container,
                level > 0 && styles.containerSub
            ]}
        >
            <View style={styles.left}>
                {level > 0 ? <View style={[styles.indent, { backgroundColor: theme.colors.border }]} /> : null}
                <Text 
                    variant={level > 0 ? 'body' : 'h3'} 
                    color={level > 0 ? 'textSecondary' : 'text'}
                    style={styles.name}
                >
                    {name}
                </Text>
                {isProtected ? <Lock size={12} color={theme.colors.textSecondary} style={styles.icon} /> : null}
            </View>
            <View style={styles.right}>
                {rightElement ? rightElement : (
                    <View style={styles.percentageContainer}>
                        <Text variant="body" color="textSecondary" style={styles.percentage}>{percentage}%</Text>
                        {onPress ? <ChevronRight size={18} color={theme.colors.border} /> : null}
                    </View>
                )}
            </View>
        </PressableScale>
    );
};

const getStyles = (theme: any, mode: string) => StyleSheet.create({
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
        backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    indent: {
        width: 16,
        height: 1,
        marginRight: theme.spacing.sm,
    },
    name: {
        fontSize: theme.typography.size.md,
    },
    icon: {
        marginLeft: theme.spacing.xs,
        opacity: 0.6,
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
        marginRight: theme.spacing.xs,
    },
});
