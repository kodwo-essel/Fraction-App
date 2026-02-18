import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import { theme } from '../constants/theme';

interface ComparisonBarData {
    label: string;
    income: number;
    expense: number;
}

interface ComparisonBarChartProps {
    data: ComparisonBarData[];
    height?: number;
}

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({ data, height = 200 }) => {
    const chartWidth = Dimensions.get('window').width - 64;
    const groupWidth = (chartWidth / data.length);
    const barWidth = groupWidth * 0.35;
    const gap = groupWidth * 0.1;

    const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Svg width={chartWidth} height={height}>
                {/* Y Axis */}
                <Line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2={height}
                    stroke={theme.colors.border}
                    strokeWidth="1"
                />
                {/* X Axis */}
                <Line
                    x1="0"
                    y1={height}
                    x2={chartWidth}
                    y2={height}
                    stroke={theme.colors.border}
                    strokeWidth="2"
                />
                {data.map((item, index) => {
                    const incomeHeight = (item.income / maxVal) * (height - 24);
                    const expenseHeight = (item.expense / maxVal) * (height - 24);
                    // Add a small padding from Y axis
                    const xOffset = 16;
                    const xStart = xOffset + index * ((chartWidth - xOffset) / data.length) + (((chartWidth - xOffset) / data.length) - (barWidth * 2 + gap)) / 2;

                    return (
                        <React.Fragment key={item.label}>
                            {/* Income Bar */}
                            <Rect
                                x={xStart}
                                y={height - incomeHeight}
                                width={barWidth}
                                height={incomeHeight}
                                fill={theme.colors.text}
                                rx={2}
                            />
                            {/* Expense Bar */}
                            <Rect
                                x={xStart + barWidth + gap}
                                y={height - expenseHeight}
                                width={barWidth}
                                height={expenseHeight}
                                fill={theme.colors.gray.medium}
                                rx={2}
                            />
                        </React.Fragment>
                    );
                })}
            </Svg>
            <View style={[styles.labels, { width: chartWidth }]}>
                {data.map(item => (
                    <Text key={item.label} style={[styles.labelText, { width: groupWidth, color: theme.colors.textSecondary }]}>
                        {item.label}
                    </Text>
                ))}
            </View>
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: theme.colors.text }]} />
                    <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Income</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: theme.colors.gray.medium }]} />
                    <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Expense</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: theme.spacing.md,
        alignItems: 'center',
    },
    labels: {
        flexDirection: 'row',
        marginTop: theme.spacing.sm,
    },
    labelText: {
        fontSize: 10,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    legend: {
        flexDirection: 'row',
        marginTop: theme.spacing.lg,
        gap: theme.spacing.lg,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },
    legendText: {
        fontSize: 10,
    },
});
