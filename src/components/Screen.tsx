import type { ReactNode } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { store, useIsDemo } from '@/store/data';
import { ui } from '@/store/ui';
import { MAX_WIDTH, RADIUS, useTheme } from '@/theme';

import { Icon } from './Icon';
import { Button, Txt } from './ui';

/** Space the web tab bar covers at the bottom of the page. */
const WEB_TAB_SPACE = 104;

function DemoBanner() {
  const { c } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        paddingLeft: 14,
        borderRadius: RADIUS.tile,
        backgroundColor: c.mostlySoft,
      }}
    >
      <Icon name="eye" size={20} color={c.mostlyText} />
      <View style={{ flex: 1 }}>
        <Txt v="calloutBold">Sample data</Txt>
        <Txt v="footnote" tone="ink2">
          A peek at seven weeks in. Nothing here is saved.
        </Txt>
      </View>
      <Button
        small
        kind="secondary"
        title="Exit"
        label="Exit sample data"
        onPress={() => {
          store.exitDemo();
          ui.toast('Back to your own data');
        }}
      />
    </View>
  );
}

/**
 * A tab page: large title, optional action on the right, then content in a centred
 * phone-width column. iOS lets the system inset the content under the native tab bar.
 */
export function Screen({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const demo = useIsDemo();
  const ios = Platform.OS === 'ios';
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentInsetAdjustmentBehavior={ios ? 'automatic' : 'never'}
      contentContainerStyle={{
        paddingTop: ios ? 8 : insets.top + 12,
        paddingBottom: Platform.OS === 'web' ? WEB_TAB_SPACE + insets.bottom : 32,
        paddingHorizontal: 20,
        alignItems: 'center',
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ width: '100%', maxWidth: MAX_WIDTH, gap: 18 }}>
        {demo ? <DemoBanner /> : null}
        {title ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 48 }}>
            <Txt v="display" accessibilityRole="header">
              {title}
            </Txt>
            {action}
          </View>
        ) : null}
        {children}
      </View>
    </ScrollView>
  );
}
