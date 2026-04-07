import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useApp } from '../../context/AppContext';

export default function TabLayout() {
  const { theme } = useApp();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          height: 88,
          paddingBottom: 32,
          paddingTop: 8,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: theme.typography.fontFamily.medium,
          fontSize: 11,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <Ionicons name="pie-chart-outline" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="disburser"
        options={{
          title: 'Allocation',
          tabBarIcon: ({ color }) => <Ionicons name="git-branch-outline" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Ledger',
          tabBarIcon: ({ color }) => <Ionicons name="list" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={26} color={color} />,
        }}
      />
      {/* Hide expense from tab bar but keep the route */}
      <Tabs.Screen
        name="expense"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
