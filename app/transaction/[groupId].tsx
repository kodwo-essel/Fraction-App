import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, Dimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, G } from 'react-native-svg';
import { EntryTransition } from '../../components/EntryTransition';
import { PressableScale } from '../../components/PressableScale';
import { Card, Text } from '../../components/Themed';
import { useApp } from '../../context/AppContext';
import { formatCompact, formatCurrency } from '../../services/allocation';
import { useAlert } from '../../context/AlertContext';
import { generateAllocationReport } from '../../services/report';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TransactionDetail() {
    const { groupId } = useLocalSearchParams<{ groupId: string }>();
    const { transactions, categories, currencyCode, theme, themeMode, deleteTransaction } = useApp();
    const { showAlert } = useAlert();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isExporting, setIsExporting] = useState(false);
    const styles = getStyles(theme, themeMode);

    const groupItems = useMemo(() => {
        return transactions.filter(t => t.group_id === groupId);
    }, [transactions, groupId]);

    const groupSummary = useMemo(() => {
        if (groupItems.length === 0) return null;
        const first = groupItems[0];
        return {
            name: first.name,
            description: first.description,
            date: first.created_at,
            total: first.total_amount || groupItems.reduce((sum, t) => sum + t.amount, 0),
            type: first.type
        };
    }, [groupItems]);

    if (!groupSummary) return null;

    const handleDelete = () => {
        showAlert({
            title: 'Delete Allocation',
            message: 'This will remove the entire allocation and revert all category balances. This cannot be undone.',
            buttons: [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive', 
                    onPress: async () => {
                        await deleteTransaction('', groupId);
                        router.back();
                    }
                }
            ]
        });
    };

    const handleExport = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            await generateAllocationReport({
                name: groupSummary.name,
                date: new Date(groupSummary.date).toLocaleDateString(),
                description: groupSummary.description,
                total: groupSummary.total,
                currencyCode,
                items: chartData
            });
        } catch (error) {
            showAlert({
                title: 'Export Failed',
                message: 'Could not generate the PDF report. Please try again.',
                buttons: [{ text: 'OK' }]
            });
        } finally {
            setIsExporting(false);
        }
    };

    const sortedItems = [...groupItems].sort((a, b) => b.amount - a.amount);
    
    // Chart Data
    const chartData = sortedItems.map((item, index) => {
        const category = categories.find(c => c.id === item.category_id);
        const percentage = (item.amount / groupSummary.total) * 100;
        
        // Generate a stable color based on index or category ID
        const colors = [
            theme.colors.primary,
            theme.colors.success,
            '#FF9F43', // Orange
            '#00CFE8', // Cyan
            '#EA5455', // Red/Error
            '#7367F0', // Purple
        ];
        const color = colors[index % colors.length];

        return {
            ...item,
            categoryName: category?.name || 'Deleted Category',
            percentage,
            color
        };
    });

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
                <PressableScale onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </PressableScale>
                <Text variant="h2" style={styles.headerTitle}>Detail</Text>
                <View style={styles.headerRight}>
                    <PressableScale onPress={handleExport} style={styles.headerIconBtn} disabled={isExporting}>
                        {isExporting ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                            <Ionicons name="share-social-outline" size={22} color={theme.colors.text} />
                        )}
                    </PressableScale>
                    <PressableScale onPress={handleDelete} style={styles.headerIconBtn}>
                        <Ionicons name="trash-outline" size={22} color={theme.colors.error} />
                    </PressableScale>
                </View>
            </View>

            <ScrollView 
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
                showsVerticalScrollIndicator={false}
            >
                <EntryTransition delay={100}>
                    <Card style={styles.summaryCard}>
                        <Text variant="label" color="textSecondary" style={styles.dateLabel}>
                            {new Date(groupSummary.date).toLocaleDateString(undefined, { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </Text>
                        <Text variant="h1" style={styles.mainTitle}>{groupSummary.name}</Text>
                        {groupSummary.description ? (
                            <Text variant="body" color="textSecondary" style={styles.description}>
                                {groupSummary.description}
                            </Text>
                        ) : null}
                        
                        <View style={styles.totalContainer}>
                            <Text variant="caption" color="textSecondary">Total Amount</Text>
                            <Text variant="h1" style={styles.totalAmount}>
                                {formatCurrency(groupSummary.total, currencyCode)}
                            </Text>
                        </View>
                    </Card>
                </EntryTransition>

                <EntryTransition delay={200}>
                    <View style={styles.chartSection}>
                        <Text variant="label" style={styles.sectionLabel}>Distribution Breakdown</Text>
                        
                        {/* Custom Segmented Bar Chart */}
                        <View style={styles.chartWrapper}>
                            <Svg height="24" width="100%">
                                <G>
                                    {chartData.reduce((acc: any[], item, i) => {
                                        const prevWidth = acc.length > 0 ? acc[i - 1].endX : 0;
                                        const currentWidth = (item.percentage / 100) * (SCREEN_WIDTH - theme.spacing.lg * 4);
                                        acc.push({
                                            x: prevWidth,
                                            width: currentWidth,
                                            endX: prevWidth + currentWidth,
                                            color: item.color
                                        });
                                        return acc;
                                    }, []).map((segment, i) => (
                                        <Rect
                                            key={i}
                                            x={segment.x}
                                            y="0"
                                            width={segment.width}
                                            height="24"
                                            fill={segment.color}
                                            rx={i === 0 ? 12 : 0}
                                            ry={i === 0 ? 12 : 0}
                                        />
                                    ))}
                                    {/* Cap the end of the bar */}
                                    <Rect
                                        x="90%"
                                        y="0"
                                        width="10%"
                                        height="24"
                                        fill={chartData[chartData.length - 1].color}
                                        rx={12}
                                        ry={12}
                                    />
                                </G>
                            </Svg>
                        </View>

                        <View style={styles.legendGrid}>
                            {chartData.map((item, i) => (
                                <View key={i} style={styles.legendItem}>
                                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                                    <Text variant="caption" color="textSecondary" numberOfLines={1} style={styles.legendText}>
                                        {item.categoryName} ({Math.round(item.percentage)}%)
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </EntryTransition>

                <EntryTransition delay={300}>
                    <View style={styles.listSection}>
                        <Text variant="label" style={styles.sectionLabel}>Individual Distributions</Text>
                        {sortedItems.map((item, i) => (
                            <View key={i} style={styles.itemRow}>
                                <View style={styles.itemInfo}>
                                    <Text variant="body" style={styles.itemName}>
                                        {categories.find(c => c.id === item.category_id)?.name || 'Deleted Category'}
                                    </Text>
                                    <View style={styles.progressTrack}>
                                        <View 
                                            style={[
                                                styles.progressFill, 
                                                { 
                                                    width: `${(item.amount / groupSummary.total) * 100}%`,
                                                    backgroundColor: theme.colors.primary 
                                                }
                                            ]} 
                                        />
                                    </View>
                                </View>
                                <Text variant="h3" style={styles.itemAmount}>
                                    {formatCurrency(item.amount, currencyCode)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </EntryTransition>
            </ScrollView>
        </View>
    );
}

const getStyles = (theme: any, mode: string) => StyleSheet.create({
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
        backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255, 255, 255, 0.05)',
    },
    headerTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 20,
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: -1,
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
        backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255, 255, 255, 0.05)',
    },
    content: {
        padding: theme.spacing.lg,
    },
    summaryCard: {
        padding: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    dateLabel: {
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    mainTitle: {
        fontSize: 28,
        lineHeight: 34,
        marginBottom: 8,
    },
    description: {
        marginBottom: 20,
        lineHeight: 22,
    },
    totalContainer: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingTop: 20,
    },
    totalAmount: {
        fontSize: 32,
        color: theme.colors.success,
        marginTop: 4,
    },
    chartSection: {
        marginBottom: 32,
    },
    sectionLabel: {
        marginBottom: 16,
        opacity: 0.6,
    },
    chartWrapper: {
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.border,
        overflow: 'hidden',
        marginBottom: 20,
    },
    legendGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: '40%',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        flex: 1,
    },
    listSection: {
        gap: 16,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    itemInfo: {
        flex: 1,
        marginRight: theme.spacing.xl,
    },
    itemName: {
        fontFamily: theme.typography.fontFamily.medium,
        marginBottom: 6,
    },
    itemAmount: {
        letterSpacing: -0.5,
    },
    progressTrack: {
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
});
