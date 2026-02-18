import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { theme } from '../constants/theme';

interface BarData {
    label: string;
    value: number;
}

interface BarChartProps {
    data: BarData[];
    height?: number;
}

export const SimpleBarChart: React.FC<BarChartProps> = ({ data, height = 200 }) => {
    const chartWidth = Dimensions.get('window').width - 64;
    const barWidth = (chartWidth / data.length) * 0.7;
    const gap = (chartWidth / data.length) * 0.3;
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <View style={styles.container}>
            <Svg width={chartWidth} height={height}>
                {data.map((item, index) => {
                    const barHeight = (item.value / maxValue) * (height - 20);
                    return (
                        <Rect
                            key={item.label}
                            x={index * (barWidth + gap)}
                            y={height - barHeight}
                            width={barWidth}
                            height={barHeight}
                            fill={theme.colors.black}
                        />
                    );
                })}
            </Svg>
            <View style={[styles.labels, { width: chartWidth }]}>
                {data.map(item => (
                    <Text key={item.label} style={[styles.labelText, { width: barWidth + gap }]}>
                        {item.label}
                    </Text>
                ))}
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
    },
});
