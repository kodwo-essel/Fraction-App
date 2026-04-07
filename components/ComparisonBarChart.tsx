import React from 'react';
import { Dimensions, StyleSheet, Text as RNText, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { Text } from './Themed';

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
    const { theme } = useApp();
    const styles = getStyles(theme);
    const chartWidth = Dimensions.get('window').width - 64;
    const groupWidth = (chartWidth / data.length);
    const barWidth = groupWidth * 0.35;
    const gap = groupWidth * 0.08;

    const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);

    return (
        <View style={styles.container}>
            <Svg width={chartWidth} height={height}>
                {/* Y Axis Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                    <Line
                        key={`grid-${p}`}
                        x1="0"
                        y1={height * (1 - p)}
                        x2={chartWidth}
                        y2={height * (1 - p)}
                        stroke={theme.colors.border}
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                ))}

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
                                fill={theme.colors.success}
                                rx={4}
                            />
                            {/* Expense Bar */}
                            <Rect
                                x={xStart + barWidth + gap}
                                y={height - expenseHeight}
                                width={barWidth}
                                height={expenseHeight}
                                fill={theme.colors.error}
                                rx={4}
                            />
                        </React.Fragment>
                    );
                })}
            </Svg>
            
            <View style={[styles.labels, { width: chartWidth }]}>
                {data.map(item => (
                    <RNText key={item.label} style={[styles.labelText, { width: groupWidth, color: theme.colors.textSecondary }]}>
                        {item.label}
                    </RNText>
                ))}
            </View>
            
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: theme.colors.success }]} />
                    <Text variant="caption" color="textSecondary">Income</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: theme.colors.error }]} />
                    <Text variant="caption" color="textSecondary">Expense</Text>
                </View>
            </View>
        </View>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
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
        fontFamily: theme.typography.fontFamily.regular,
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
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});
