import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import React from 'react';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon
          sf="chart.pie.fill"
          androidSrc={<VectorIcon family={MaterialIcons} name="dashboard" />}
        />
        <Label>Insights</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="disburser">
        <Icon
          sf="arrow.up.right.circle.fill"
          androidSrc={<VectorIcon family={Feather} name="pie-chart" />}
        />
        <Label>Allocation</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="expense">
        <Icon
          sf="plus.circle.fill"
          androidSrc={<VectorIcon family={MaterialIcons} name="attach-money" />}
        />
        <Label>Expense</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history">
        <Icon
          sf="clock.fill"
          androidSrc={<VectorIcon family={MaterialIcons} name="history" />}
        />
        <Label>History</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Icon
          sf="gearshape.fill"
          androidSrc={<VectorIcon family={MaterialIcons} name="settings" />}
        />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
