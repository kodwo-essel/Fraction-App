import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BalanceCard } from '../../components/BalanceCard';
import { CategoryRow } from '../../components/CategoryRow';
import { ComparisonBarChart } from '../../components/ComparisonBarChart';
import { EntryTransition } from '../../components/EntryTransition';
import { SimplePieChart } from '../../components/SimplePieChart';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { theme } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function Dashboard() {
  const { categories, transactions, getCategoryBalance, isLoading, userName } = useApp();
  const insets = useSafeAreaInsets();

  const totalIncome = React.useMemo(() => {
    const uniqueGroups = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        acc[t.group_id] = t.total_amount;
        return acc;
      }, {} as Record<string, number>);
    return Object.values(uniqueGroups).reduce((acc, val) => acc + val, 0);
  }, [transactions]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + theme.spacing.lg, paddingBottom: insets.bottom + 80 }
          ]}
        >
          <SkeletonLoader height={40} width={150} style={{ marginBottom: 30 }} />
          <SkeletonLoader height={160} style={{ marginBottom: 20 }} borderRadius={theme.roundness.md} />
          <View style={styles.statsRow}>
            <SkeletonLoader height={80} style={{ flex: 0.48 }} borderRadius={theme.roundness.md} />
            <SkeletonLoader height={80} style={{ flex: 0.48 }} borderRadius={theme.roundness.md} />
          </View>
          <SkeletonLoader height={200} style={{ marginTop: 40 }} borderRadius={theme.roundness.md} />
        </ScrollView>
      </View>
    );
  }

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalBalance = totalIncome - totalExpenses;

  const mainCategories = categories.filter(c => c.type === 'main');

  // Data for Comparison Bar Chart (Income vs Expense)
  const comparisonData = mainCategories.map(c => {
    // For Income, we sum up leaf nodes within this main category's branch
    // Since we now only record leaf nodes, this filter is safe.
    // To be super safe against old data, we sum amount only for leaf categories.
    const catIn = transactions
      .filter(t => {
        const isSelf = t.category_id === c.id;
        const isChild = categories.find(sub => sub.id === t.category_id)?.parent_id === c.id;
        const hasChildren = categories.some(sub => sub.parent_id === t.category_id);
        return t.type === 'income' && (isSelf || isChild) && !hasChildren;
      })
      .reduce((acc, t) => acc + t.amount, 0);

    const catOut = transactions
      .filter(t => {
        const isSelf = t.category_id === c.id;
        const isChild = categories.find(sub => sub.id === t.category_id)?.parent_id === c.id;
        return t.type === 'expense' && (isSelf || isChild);
      })
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      label: c.name.substring(0, 4),
      income: catIn,
      expense: catOut
    };
  });

  // Data for Pie Chart (Current Rules)
  const pieData = mainCategories.map((c, i) => {
    const colors = [theme.colors.black, theme.colors.gray.dark, theme.colors.gray.medium, theme.colors.gray.light, theme.colors.border];
    return {
      label: c.name,
      value: c.percentage,
      color: colors[i % colors.length]
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + theme.spacing.lg, paddingBottom: insets.bottom + 80 }
        ]}
      >
        <EntryTransition delay={100}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>Welcome back,</Text>
              <Text style={[styles.brand, { color: theme.colors.text }]}>{userName || 'User'}</Text>
            </View>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
        </EntryTransition>

        <EntryTransition delay={200}>
          <BalanceCard
            label="Total Balance"
            amount={totalBalance}
            large
          />
        </EntryTransition>

        <EntryTransition delay={300}>
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { borderColor: theme.colors.border }]}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Income</Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>+${totalIncome.toFixed(0)}</Text>
            </View>
            <View style={[styles.statBox, { borderColor: theme.colors.border }]}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Expenses</Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>-${totalExpenses.toFixed(0)}</Text>
            </View>
          </View>
        </EntryTransition>

        <EntryTransition delay={400}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Rules Distribution</Text>
          <SimplePieChart data={pieData} />
        </EntryTransition>

        <EntryTransition delay={500}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Income vs Expenses</Text>
          <ComparisonBarChart data={comparisonData} />
        </EntryTransition>

        <EntryTransition delay={600}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Categories</Text>
          <View style={[styles.listContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
            {mainCategories.map((cat, index) => (
              <CategoryRow
                key={cat.id}
                name={cat.name}
                percentage={cat.percentage}
                isProtected={cat.is_protected}
                rightElement={<Text style={[styles.catBalance, { color: theme.colors.text }]}>${getCategoryBalance(cat.id).toFixed(0)}</Text>}
              />
            ))}
          </View>
        </EntryTransition>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  greeting: {
    fontSize: theme.typography.size.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  brand: {
    fontSize: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.bold as any,
    letterSpacing: -1,
  },
  headerLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.gray.light,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statBox: {
    flex: 0.48,
    borderWidth: 1,
    padding: theme.spacing.md,
    borderRadius: theme.roundness.md,
  },
  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold as any,
  },
  sectionTitle: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.bold as any,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  listContainer: {
    borderWidth: 1,
    borderRadius: theme.roundness.md,
    overflow: 'hidden',
  },
  catBalance: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.medium as any,
  }
});
