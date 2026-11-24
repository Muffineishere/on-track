import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ui, useUI } from '@/store/ui';
import { RADIUS, useTheme } from '@/theme';

import { Pressy, Txt } from './ui';

/**
 * A short message at the top of the screen, with Undo for changes that can be reversed.
 * `hideUnderSheet` keeps the app-level copy out of the way while a sheet shows its own.
 */
export function ToastView({ hideUnderSheet }: { hideUnderSheet?: boolean }) {
  const toast = useUI((s) => s.toast);
  const sheetOpen = useUI((s) => s.sheet !== null);
  const { c, dark } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const id = toast.id;
    const timer = setTimeout(() => ui.hideToast(id), toast.undo ? 5000 : 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast || (hideUnderSheet && sheetOpen)) return null;
  const bg = dark ? '#EDF1EE' : '#1D2621';
  const fg = dark ? '#1D2621' : '#FFFFFF';
  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', top: insets.top + 8, left: 0, right: 0, alignItems: 'center', zIndex: 50 }}
    >
      <Animated.View
        key={toast.id}
        entering={FadeInUp.duration(220)}
        exiting={FadeOutUp.duration(160)}
        accessibilityLiveRegion="polite"
        aria-live="polite"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          maxWidth: '92%',
          minHeight: 48,
          paddingLeft: 18,
          paddingRight: toast.undo ? 6 : 18,
          borderRadius: RADIUS.pill,
          backgroundColor: bg,
          boxShadow: '0 8px 30px rgba(0,0,0,0.22)',
        }}
      >
        <Txt v="calloutBold" color={fg} style={{ flexShrink: 1 }}>
          {toast.text}
        </Txt>
        {toast.undo ? (
          <Pressy
            label="Undo"
            onPress={() => {
              const f = toast.undo;
              ui.hideToast(toast.id);
              f?.();
            }}
            style={{
              minHeight: 44,
              paddingHorizontal: 14,
              borderRadius: RADIUS.pill,
              backgroundColor: dark ? '#D8E0DA' : '#33403A',
              justifyContent: 'center',
            }}
          >
            <Txt v="calloutBold" color={dark ? c.brand : '#B9E4C8'}>
              Undo
            </Txt>
          </Pressy>
        ) : null}
      </Animated.View>
    </View>
  );
}
