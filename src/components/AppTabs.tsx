import { NativeTabs } from 'expo-router/native-tabs';

import { FONT, useTheme } from '@/theme';

/** The system tab bar on iOS and Android: Liquid Glass on iOS 26, Material on Android. */
export default function AppTabs() {
  const { c } = useTheme();
  return (
    <NativeTabs
      tintColor={c.brandText}
      iconColor={{ default: c.ink3, selected: c.brandText }}
      backgroundColor={c.surface}
      badgeBackgroundColor={c.flame}
      labelStyle={{
        default: { fontFamily: FONT.bold, fontSize: 11, color: c.ink3 },
        selected: { fontFamily: FONT.heavy, fontSize: 11, color: c.brandText },
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'leaf', selected: 'leaf.fill' }} md="eco" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="garden">
        <NativeTabs.Trigger.Label>Garden</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'camera.macro', selected: 'camera.macro' }} md="local_florist" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="weight">
        <NativeTabs.Trigger.Label>Weight</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'scalemass', selected: 'scalemass.fill' }} md="monitor_weight" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="plan">
        <NativeTabs.Trigger.Label>Plan</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'list.bullet.clipboard', selected: 'list.bullet.clipboard.fill' }} md="checklist" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
