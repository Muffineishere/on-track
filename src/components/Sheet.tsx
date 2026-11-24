import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { GestureDetector, GestureHandlerRootView, usePanGesture } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { MAX_WIDTH, RADIUS, useTheme } from '@/theme';

import { ToastView } from './Toast';

interface SheetApi {
  close: () => void;
}

const SheetContext = createContext<SheetApi>({ close: () => {} });
/** Lets sheet content close its own sheet with the exit animation. */
export const useSheet = () => useContext(SheetContext);

interface Props {
  children: ReactNode;
  onClosed: () => void;
  /** Runs when the person dismisses the sheet (backdrop, swipe, back, Escape), before it animates away. */
  onDismiss?: () => void;
  /** Full-screen takeover, used by the celebration and onboarding. */
  full?: boolean;
  fullBackground?: string;
  /** False keeps the sheet open until its own button closes it. */
  dismissable?: boolean;
  label: string;
}

/**
 * A bottom sheet in its own native modal layer: slides up, dims the app behind it,
 * closes by swiping the handle down, tapping outside, the Android back button or Escape.
 */
export function Sheet(props: Props) {
  return (
    <Modal
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      visible
      onRequestClose={() => closeRef.current?.(true)}
    >
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SheetBody {...props} />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Modal>
  );
}

const closeRef: { current: ((user: boolean) => void) | null } = { current: null };

function SheetBody({ children, onClosed, onDismiss, full, fullBackground, dismissable = true, label }: Props) {
  const { c, floating } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const reduce = useReducedMotion();
  const p = useSharedValue(0);
  const drag = useSharedValue(0);
  const closing = useRef(false);

  useEffect(() => {
    p.set(reduce ? 1 : withTiming(1, { duration: full ? 260 : 340, easing: Easing.bezier(0.2, 0.9, 0.25, 1) }));
  }, [p, reduce, full]);

  const finish = useCallback(() => onClosed(), [onClosed]);

  const close = useCallback(
    (byUser = false) => {
      if (closing.current) return;
      if (byUser && !dismissable) return;
      closing.current = true;
      if (byUser) onDismiss?.();
      if (reduce) {
        finish();
        return;
      }
      p.set(
        withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) }, (done) => {
          if (done) scheduleOnRN(finish);
        }),
      );
    },
    [dismissable, onDismiss, reduce, finish, p],
  );

  useEffect(() => {
    closeRef.current = close;
    return () => {
      if (closeRef.current === close) closeRef.current = null;
    };
  }, [close]);

  const pan = usePanGesture({
    enabled: dismissable && !full,
    activeOffsetY: 6,
    onUpdate: (e) => {
      drag.value = Math.max(0, e.translationY);
    },
    onDeactivate: (e) => {
      if (drag.value > 110 || (drag.value > 30 && e.velocityY > 700)) {
        scheduleOnRN(close, true);
      } else drag.value = withSpring(0, { damping: 20, stiffness: 240 });
    },
  });

  const backdrop = useAnimatedStyle(() => ({ opacity: p.value }));
  const panel = useAnimatedStyle(() =>
    full
      ? { opacity: p.value, transform: [{ scale: 1.03 - 0.03 * p.value }] }
      : { transform: [{ translateY: (1 - p.value) * height * 0.9 + drag.value }] },
  );

  const api = { close: () => close(false) };

  if (full) {
    return (
      <SheetContext.Provider value={api}>
        <Animated.View
          accessibilityViewIsModal
          aria-label={label}
          style={[StyleSheet.absoluteFill, { backgroundColor: fullBackground ?? c.bg }, panel]}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 20,
              paddingHorizontal: 22,
              alignItems: 'center',
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ width: '100%', maxWidth: MAX_WIDTH - 80, flexGrow: 1 }}>{children}</View>
          </ScrollView>
          <ToastView />
        </Animated.View>
      </SheetContext.Provider>
    );
  }

  return (
    <SheetContext.Provider value={api}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }, backdrop]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => close(true)}
          accessibilityRole="button"
          accessibilityLabel="Close"
          disabled={!dismissable}
          tabIndex={-1}
        />
      </Animated.View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.anchor} pointerEvents="box-none">
        <Animated.View
          accessibilityViewIsModal
          aria-modal
          aria-label={label}
          role="dialog"
          style={[
            styles.panel,
            {
              backgroundColor: c.bg,
              maxHeight: height - insets.top - 12,
              borderTopLeftRadius: RADIUS.sheet,
              borderTopRightRadius: RADIUS.sheet,
            },
            floating,
            panel,
          ]}
        >
          <GestureDetector gesture={pan}>
            <View style={styles.grab}>
              <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: c.surface3 }} />
            </View>
          </GestureDetector>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            bounces={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20, gap: 18 }}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
      <ToastView />
    </SheetContext.Provider>
  );
}

const styles = StyleSheet.create({
  anchor: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  panel: { width: '100%', maxWidth: MAX_WIDTH, overflow: 'hidden' },
  grab: { height: 28, alignItems: 'center', justifyContent: 'center' },
});
