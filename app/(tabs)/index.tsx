import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryRow } from '../../components/CategoryRow';
import { EntryTransition } from '../../components/EntryTransition';
import { PressableScale } from '../../components/PressableScale';
import { SimplePieChart } from '../../components/SimplePieChart';
import { Button, Card, Text } from '../../components/Themed';
import { useApp } from '../../context/AppContext';
import { formatCompact, formatCurrency } from '../../services/allocation';

export default function Dashboard() {
  const { categories, transactions, getCategoryBalance, isLoading, userName, currencyCode, theme, themeMode } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const styles = getStyles(theme);

  const totalBalance = categories.reduce((sum, cat) => sum + getCategoryBalance(cat.id), 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const mainCategories = categories.filter(c => c.type === 'main');

  const CHART_PALETTE = themeMode === 'light'
    ? [theme.colors.black, theme.colors.zinc[700], theme.colors.zinc[500], theme.colors.zinc[300], theme.colors.zinc[100]]
    : [theme.colors.white, theme.colors.zinc[300], theme.colors.zinc[500], theme.colors.zinc[700], theme.colors.zinc[900]];

  const pieData = mainCategories
    .map((cat, idx) => ({
      label: cat.name,
      value: getCategoryBalance(cat.id),
      color: CHART_PALETTE[idx % CHART_PALETTE.length],
    }))
    .filter(d => d.value > 0);

  const hasRules = categories.some(c => c.type === 'main' && c.id !== 'system_others');

  if (isLoading) return null;

  const profileIconUrl = `https://img.icons8.com/?size=100&id=7819&format=png&color=${themeMode === 'light' ? '000000' : 'ffffff'}`;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + theme.spacing.lg, paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <EntryTransition delay={0}>
          <View style={styles.header}>
            <View>
              <Text variant="h1" style={styles.brand}>Fraction</Text>
              <Text variant="label" color="textSecondary">
                Analysis for {userName || 'User'}
              </Text>
            </View>
            <PressableScale onPress={() => router.push('/settings')}>
              <Image
                source={{ uri: profileIconUrl }}
                style={styles.profileIcon}
              />
            </PressableScale>
          </View>
        </EntryTransition>

        <EntryTransition delay={100}>
          <Card style={styles.balanceCard}>
            <Text variant="label" color="textSecondary" style={styles.balanceLabel}>Total Available</Text>
            <Text variant="h1" style={styles.balanceAmount}>{formatCompact(totalBalance, currencyCode)}</Text>
          </Card>
        </EntryTransition>

        <EntryTransition delay={150}>
          <View style={styles.actionContainer}>
            <Button
              title="Expense"
              variant="primary"
              onPress={() => router.push('/expense')}
              style={styles.actionBtn}
            />
            <Button
              title="Allocate"
              variant="secondary"
              onPress={() => router.push('/disburser')}
              style={styles.actionBtn}
            />
          </View>
        </EntryTransition>

        <EntryTransition delay={200}>
          <View style={styles.statsRow}>
            <Card style={styles.statBox}>
              <Text variant="label" color="textSecondary" style={styles.statLabel}>Income</Text>
              <Text variant="h3" color="success" style={styles.statValue}>+{formatCompact(totalIncome, currencyCode)}</Text>
            </Card>
            <Card style={styles.statBox}>
              <Text variant="label" color="textSecondary" style={styles.statLabel}>Expenses</Text>
              <Text variant="h3" color="error" style={styles.statValue}>-{formatCompact(totalExpenses, currencyCode)}</Text>
            </Card>
          </View>
        </EntryTransition>

        <EntryTransition delay={300}>
          <View style={styles.sectionHeader}>
            <Text variant="label" color="textSecondary">Distribution</Text>
          </View>
          <Card style={styles.chartCard}>
            <SimplePieChart data={pieData} />
            <Button
              title={hasRules ? "Edit Rules" : "Configure Rules"}
              variant="primary"
              onPress={() => router.push('/configuration')}
              style={styles.configBtn}
            />
          </Card>
        </EntryTransition>

        <EntryTransition delay={400}>
          <View style={styles.sectionHeader}>
            <Text variant="label" color="textSecondary">Rules & Category Balances</Text>
          </View>
          <Card style={styles.categoriesCard}>
            {mainCategories.map((cat, idx) => (
              <CategoryRow
                key={cat.id}
                name={cat.name}
                percentage={cat.percentage}
                isProtected={cat.is_protected}
                rightElement={
                  <Text variant="h3" style={styles.catBalance}>
                    {formatCompact(getCategoryBalance(cat.id), currencyCode)}
                  </Text>
                }
              />
            ))}
          </Card>
        </EntryTransition>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  brand: {
    letterSpacing: -1.5,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  balanceCard: {
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  balanceLabel: {
    marginBottom: theme.spacing.xs,
  },
  balanceAmount: {
    fontSize: 42,
    letterSpacing: -2,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  actionBtn: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statBox: {
    flex: 1,
    padding: theme.spacing.md,
  },
  statLabel: {
    marginBottom: 4,
  },
  statValue: {
    letterSpacing: -0.5,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  configBtn: {
    marginTop: theme.spacing.lg,
  },
  chartCard: {
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  categoriesCard: {
    padding: 0,
    overflow: 'hidden',
  },
  catBalance: {
    letterSpacing: -0.5,
  },
});
