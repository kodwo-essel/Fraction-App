import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { theme } from '../constants/theme';

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
    const total = data.reduce((acc, d) => acc + d.value, 0);
    const radius = size / 2;
    const center = radius;

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
                        {data.map((item, index) => {
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
                        <Text style={[styles.legendLabel, { color: theme.colors.textSecondary }]}>{item.label}</Text>
                        <Text style={[styles.legendValue, { color: theme.colors.text }]}>{((item.value / total) * 100).toFixed(0)}%</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
        fontSize: 12,
        minWidth: 70,
    },
    legendValue: {
        fontSize: 12,
        fontWeight: theme.typography.weight.bold as any,
    },
});
