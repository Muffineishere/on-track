import { TabList, TabSlot, TabTrigger, Tabs, type TabListProps, type TabTriggerSlotProps } from 'expo-router/ui';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptic } from '@/lib/haptics';
import { MAX_WIDTH, RADIUS, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Pressy, Txt } from './ui';

const TABS: { name: string; href: '/' | '/garden' | '/weight' | '/plan'; title: string; icon: IconName }[] = [
  { name: 'index', href: '/', title: 'Today', icon: 'sprout' },
  { name: 'garden', href: '/garden', title: 'Garden', icon: 'flower' },
  { name: 'weight', href: '/weight', title: 'Weight', icon: 'scale' },
  { name: 'plan', href: '/plan', title: 'Plan', icon: 'list' },
];

/** On the web there is no system tab bar, so the app draws its own floating one. */
export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <Bar>
          {TABS.map((t) => (
            <TabTrigger key={t.name} name={t.name} href={t.href} asChild>
              <TabButton icon={t.icon} title={t.title} />
            </TabTrigger>
          ))}
        </Bar>
      </TabList>
    </Tabs>
  );
}

function TabButton({ isFocused, icon, title, onPress, ...props }: TabTriggerSlotProps & { icon: IconName; title: string }) {
  const { c } = useTheme();
  return (
    <Pressy
      {...(props as object)}
      role="tab"
      label={title}
      state={{ selected: !!isFocused }}
      feedback="none"
      squash={0.92}
      onPress={(e) => {
        haptic.select();
        onPress?.(e);
      }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 56, borderRadius: RADIUS.tile }}
    >
      <View
        style={{
          width: 52,
          height: 30,
          borderRadius: 15,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isFocused ? c.brandSoft : 'transparent',
        }}
      >
        <Icon name={icon} size={22} color={isFocused ? c.brandText : c.ink3} />
      </View>
      <Txt v="label" style={{ fontSize: 11, lineHeight: 13 }} tone={isFocused ? 'brand' : 'ink3'}>
        {title}
      </Txt>
    </Pressy>
  );
}

function Bar(props: TabListProps) {
  const { c, dark } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      {...props}
      role="tablist"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 12,
      }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: MAX_WIDTH - 40,
          flexDirection: 'row',
          padding: 6,
          borderRadius: RADIUS.card,
          backgroundColor: c.surface,
          borderWidth: 1,
          borderColor: c.line,
          boxShadow: dark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(29,38,33,0.12)',
        }}
      >
        {props.children}
      </View>
    </View>
  );
}
