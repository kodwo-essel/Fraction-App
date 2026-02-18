import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
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
        <View style={styles.container}>
            <Svg width={chartWidth} height={height}>
                {data.map((item, index) => {
                    const incomeHeight = (item.income / maxVal) * (height - 24);
                    const expenseHeight = (item.expense / maxVal) * (height - 24);
                    const xStart = index * groupWidth + (groupWidth - (barWidth * 2 + gap)) / 2;

                    return (
                        <React.Fragment key={item.label}>
                            {/* Income Bar */}
                            <Rect
                                x={xStart}
                                y={height - incomeHeight}
                                width={barWidth}
                                height={incomeHeight}
                                fill={theme.colors.black}
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
                    <Text key={item.label} style={[styles.labelText, { width: groupWidth }]}>
                        {item.label}
                    </Text>
                ))}
            </View>
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: theme.colors.black }]} />
                    <Text style={styles.legendText}>Income</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: theme.colors.gray.medium }]} />
                    <Text style={styles.legendText}>Expense</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
    },
    labels: {
        flexDirection: 'row',
        marginTop: theme.spacing.sm,
    },
    labelText: {
        fontSize: 10,
        color: theme.colors.textSecondary,
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
        color: theme.colors.textSecondary,
    },
});
