import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { Text } from './Themed';

interface PieData {
    label: string;
    value: number;
    color: string;
}

interface SimplePieChartProps {
    data: PieData[];
    size?: number;
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({ data, size = 180 }) => {
    const { theme } = useApp();
    const styles = getStyles(theme);
    const total = data.reduce((acc, d) => acc + d.value, 0);
    const radius = size / 2;
    const center = radius;

    if (data.length === 0 || total === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="pie-chart-outline" size={48} color={theme.colors.text} />
                <Text variant="h3" style={styles.emptyTitle}>No Rules Yet</Text>
                <Text variant="caption" color="textSecondary" style={styles.emptySubtitle}>
                    Set up budget categories in Allocation to see your distribution here.
                </Text>
            </View>
        );
    }

    let currentAngle = 0;

    const getPath = (startAngle: number, endAngle: number) => {
        const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
        const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
        const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
        const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);

        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

        return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.chartWrapper}>
                <Svg width={size} height={size}>
                    <G rotation="-90" origin={`${center}, ${center}`}>
                        {data.map((item) => {
                            if (item.value === 0) return null;
                            const wedgeAngle = (item.value / total) * 360;
                            const path = getPath(currentAngle, currentAngle + wedgeAngle);
                            currentAngle += wedgeAngle;

                            return (
                                <Path
                                    key={item.label}
                                    d={path}
                                    fill={item.color}
                                    stroke={theme.colors.background}
                                    strokeWidth={2}
                                />
                            );
                        })}
                    </G>
                </Svg>
            </View>
            <View style={styles.legend}>
                {data.map((item) => (
                    <View key={item.label} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: item.color, borderColor: theme.colors.border }]} />
                        <Text variant="caption" color="textSecondary" style={styles.legendLabel}>{item.label}</Text>
                        <Text variant="caption" style={styles.legendValue}>
                            {total > 0 ? ((item.value / total) * 100).toFixed(0) : '0'}%
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.xl,
        padding: theme.spacing.md,
    },
    chartWrapper: {
    },
    legend: {
        gap: theme.spacing.xs,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    legendColor: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
    },
    legendLabel: {
        minWidth: 70,
    },
    legendValue: {
        fontFamily: theme.typography.fontFamily.bold,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xl,
        gap: theme.spacing.sm,
    },
    emptyTitle: {
        marginTop: theme.spacing.xs,
    },
    emptySubtitle: {
        textAlign: 'center',
        maxWidth: 260,
        lineHeight: 20,
    },
});

