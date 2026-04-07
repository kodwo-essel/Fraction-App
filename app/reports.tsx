import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { EntryTransition } from '../components/EntryTransition';
import { PressableScale } from '../components/PressableScale';
import { Card, Text } from '../components/Themed';
import { useApp } from '../context/AppContext';
import { formatCompact } from '../services/allocation';
import { generateSummaryReport } from '../services/report';

export default function ReportsScreen() {
    const { transactions, categories, currencyCode, theme, themeMode, userName } = useApp();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isExporting, setIsExporting] = useState(false);

    const styles = getStyles(theme, themeMode);

    const metrics = useMemo(() => {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const netSavings = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
        const totalCount = transactions.length;

        return { totalIncome, totalExpense, netSavings, savingsRate, totalCount };
    }, [transactions]);

    const monthlyTrends = useMemo(() => {
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthLabel = d.toLocaleString('default', { month: 'short' });
            
            const monthTransactions = transactions.filter(t => {
                const td = new Date(t.created_at);
                return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth();
            });

            const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

            months.push({ label: monthLabel, income, expense });
        }
        return months;
    }, [transactions]);

    const topCategories = useMemo(() => {
        const spentByCategory: Record<string, { id: string, name: string, amount: number, count: number }> = {};
        
        transactions.filter(t => t.type === 'expense').forEach(t => {
            if (!spentByCategory[t.category_id]) {
                const cat = categories.find(c => c.id === t.category_id);
                spentByCategory[t.category_id] = { 
                    id: t.category_id, 
                    name: cat?.name || 'Unknown', 
                    amount: 0, 
                    count: 0 
                };
            }
            spentByCategory[t.category_id].amount += t.amount;
            spentByCategory[t.category_id].count += 1;
        });

        return Object.values(spentByCategory)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    }, [transactions, categories]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await generateSummaryReport({
                userName: userName || 'User',
                currencyCode,
                metrics,
                monthlyTrends,
                topCategories
            });
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
                <PressableScale onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </PressableScale>
                
                <Text variant="h2" style={styles.headerTitle}>Analytics</Text>
                
                <View style={styles.headerRight}>
                    <PressableScale onPress={handleExport} style={styles.headerIconBtn} disabled={isExporting}>
                        {isExporting ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                            <Ionicons name="share-social-outline" size={22} color={theme.colors.text} />
                        )}
                    </PressableScale>
                </View>
            </View>

            <ScrollView 
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Metrics Summary */}
                <EntryTransition delay={0}>
                    <View style={styles.sectionHeader}>
                        <Text variant="label" color="textSecondary">Lifetime Summary</Text>
                    </View>
                    <Card style={styles.summaryCard}>
                        <View style={styles.metricRow}>
                            <View style={styles.metricItem}>
                                <Text variant="label" color="textSecondary">Income</Text>
                                <Text variant="h3" color="success">+{formatCompact(metrics.totalIncome, currencyCode)}</Text>
                            </View>
                            <View style={styles.metricItem}>
                                <Text variant="label" color="textSecondary">Expenses</Text>
                                <Text variant="h3" color="error">-{formatCompact(metrics.totalExpense, currencyCode)}</Text>
                            </View>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                        <View style={styles.metricRow}>
                            <View style={styles.metricItem}>
                                <Text variant="label" color="textSecondary">Net Savings</Text>
                                <Text variant="h3">{formatCompact(metrics.netSavings, currencyCode)}</Text>
                            </View>
                            <View style={styles.metricItem}>
                                <Text variant="label" color="textSecondary">Savings Rate</Text>
                                <Text variant="h3" color="primary">{metrics.savingsRate.toFixed(1)}%</Text>
                            </View>
                        </View>
                    </Card>
                </EntryTransition>

                {/* Monthly Trends Chart */}
                <EntryTransition delay={100}>
                    <View style={styles.sectionHeader}>
                        <Text variant="label" color="textSecondary">Monthly Trends</Text>
                    </View>
                    <Card style={styles.chartCard}>
                        <MonthlyBarChart data={monthlyTrends} theme={theme} />
                        <View style={styles.chartLegend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendBox, { backgroundColor: theme.colors.success }]} />
                                <Text variant="caption" color="textSecondary">Income</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendBox, { backgroundColor: theme.colors.error }]} />
                                <Text variant="caption" color="textSecondary">Expenses</Text>
                            </View>
                        </View>
                    </Card>
                </EntryTransition>

                {/* Top Categories */}
                <EntryTransition delay={200}>
                    <View style={styles.sectionHeader}>
                        <Text variant="label" color="textSecondary">Top Spending Categories</Text>
                    </View>
                    <Card style={styles.topCategoriesCard}>
                        {topCategories.length > 0 ? topCategories.map((cat, idx) => (
                            <View key={cat.id} style={[styles.categoryRow, idx < topCategories.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
                                <View style={styles.categoryInfo}>
                                    <Text variant="label">{cat.name}</Text>
                                    <Text variant="caption" color="textSecondary">{cat.count} transactions</Text>
                                </View>
                                <Text variant="h3" color="error">-{formatCompact(cat.amount, currencyCode)}</Text>
                            </View>
                        )) : (
                            <View style={styles.emptyState}>
                                <Text variant="caption" color="textSecondary">No expense data available</Text>
                            </View>
                        )}
                    </Card>
                </EntryTransition>
            </ScrollView>
        </View>
    );
}

function MonthlyBarChart({ data, theme }: { data: any[], theme: any }) {
    const chartHeight = 150;
    const chartWidth = 300;
    const barWidth = 12;
    const gap = 30;
    
    const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense, 1000)));

    return (
        <Svg width="100%" height={chartHeight + 30} viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}>
            {data.map((d, i) => {
                const incomeH = (d.income / maxVal) * chartHeight;
                const expenseH = (d.expense / maxVal) * chartHeight;
                const x = i * (barWidth * 2 + gap) + 20;

                return (
                    <React.Fragment key={i}>
                        {/* Income Bar */}
                        <Rect
                            x={x}
                            y={chartHeight - incomeH}
                            width={barWidth}
                            height={incomeH}
                            fill={theme.colors.success}
                            rx={4}
                        />
                        {/* Expense Bar */}
                        <Rect
                            x={x + barWidth + 4}
                            y={chartHeight - expenseH}
                            width={barWidth}
                            height={expenseH}
                            fill={theme.colors.error}
                            rx={4}
                        />
                        {/* Month Label */}
                        <SvgText
                            x={x + barWidth}
                            y={chartHeight + 20}
                            fontSize="10"
                            fill={theme.colors.textSecondary}
                            textAnchor="middle"
                        >
                            {d.label}
                        </SvgText>
                    </React.Fragment>
                );
            })}
        </Svg>
    );
}

const getStyles = (theme: any, themeMode: string) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        backgroundColor: theme.colors.background,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: themeMode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255, 255, 255, 0.05)',
    },
    headerTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 20,
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerIconBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: themeMode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255, 255, 255, 0.05)',
    },
    content: {
        padding: theme.spacing.lg,
    },
    sectionHeader: {
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.xs,
    },
    summaryCard: {
        padding: theme.spacing.lg,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricItem: {
        flex: 1,
    },
    divider: {
        height: 1,
        marginVertical: theme.spacing.lg,
        opacity: 0.5,
    },
    chartCard: {
        padding: theme.spacing.lg,
        alignItems: 'center',
    },
    chartLegend: {
        flexDirection: 'row',
        gap: theme.spacing.lg,
        marginTop: theme.spacing.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    legendBox: {
        width: 10,
        height: 10,
        borderRadius: 2,
    },
    topCategoriesCard: {
        padding: 0,
        overflow: 'hidden',
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    categoryInfo: {
        flex: 1,
    },
    emptyState: {
        padding: theme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
