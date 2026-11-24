import { useEffect, useState, type ReactNode } from 'react';
import {
  Pressable,
  Text,
  View,
  type AccessibilityRole,
  type AccessibilityState,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { RADIUS, TYPE, isWeb, useTheme, type TypeVariant } from '@/theme';

import { Icon, type IconName } from './Icon';

/* ---------- Text ---------- */

type Tone = 'ink' | 'ink2' | 'ink3' | 'brand' | 'onBrand' | 'danger';

export function Txt({
  v = 'body',
  tone = 'ink',
  color,
  center,
  style,
  ...rest
}: TextProps & { v?: TypeVariant; tone?: Tone; color?: string; center?: boolean }) {
  const { c } = useTheme();
  const map: Record<Tone, string> = { ink: c.ink, ink2: c.ink2, ink3: c.ink3, brand: c.brandText, onBrand: c.onBrand, danger: c.danger };
  return (
    <Text
      maxFontSizeMultiplier={1.6}
      {...rest}
      style={[TYPE[v], { color: color ?? map[tone] }, center && { textAlign: 'center' }, style]}
    />
  );
}

/* ---------- Pressable with a soft squash ---------- */

const APressable = Animated.createAnimatedComponent(Pressable);

// The focus ring is for keyboard users: show it after Tab, hide it after a click or tap.
let keyboardMode = false;
if (isWeb && typeof document !== 'undefined') {
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Tab') keyboardMode = true;
    },
    true,
  );
  document.addEventListener(
    'pointerdown',
    () => {
      keyboardMode = false;
    },
    true,
  );
}

export interface PressyProps extends Omit<PressableProps, 'style' | 'children' | 'role'> {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  /** How far the control shrinks while pressed. */
  squash?: number;
  feedback?: 'tap' | 'select' | 'none';
  role?: AccessibilityRole;
  label?: string;
  state?: AccessibilityState;
}

/**
 * Every tappable thing in the app: a spring squash on press, a haptic, a visible focus
 * ring for keyboards on the web, a pointer cursor, and a dimmed disabled state.
 */
export function Pressy({
  style,
  children,
  squash = 0.96,
  feedback = 'tap',
  role = 'button',
  label,
  state,
  disabled,
  onPress,
  ...rest
}: PressyProps) {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const s = useSharedValue(1);
  const [focused, setFocused] = useState(false);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <APressable
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, ...state }}
      disabled={disabled}
      onPressIn={() => {
        if (!reduce) s.set(withSpring(squash, { damping: 18, stiffness: 420 }));
      }}
      onPressOut={() => {
        s.set(withSpring(1, { damping: 14, stiffness: 260 }));
      }}
      onPress={(e) => {
        if (feedback === 'tap') haptic.tap();
        else if (feedback === 'select') haptic.select();
        onPress?.(e);
      }}
      onFocus={() => setFocused(keyboardMode)}
      onBlur={() => setFocused(false)}
      style={[
        style,
        anim,
        isWeb && { cursor: disabled ? 'not-allowed' : 'pointer' },
        disabled && { opacity: 0.45 },
        isWeb && focused && { outlineColor: c.focus, outlineStyle: 'solid', outlineWidth: 3, outlineOffset: 2 },
      ]}
      {...rest}
    >
      {children}
    </APressable>
  );
}

/* ---------- Buttons ---------- */

type ButtonKind = 'primary' | 'secondary' | 'quiet' | 'danger';

export function Button({
  title,
  onPress,
  kind = 'primary',
  icon,
  disabled,
  small,
  style,
  label,
}: {
  title: string;
  onPress: () => void;
  kind?: ButtonKind;
  icon?: IconName;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  const { c } = useTheme();
  const bg = kind === 'primary' ? c.brand : kind === 'secondary' ? c.surface2 : kind === 'danger' ? c.missedSoft : 'transparent';
  const fg = kind === 'primary' ? c.onBrand : kind === 'danger' ? c.danger : kind === 'quiet' ? c.brandText : c.ink;
  return (
    <Pressy
      onPress={onPress}
      disabled={disabled}
      label={label ?? title}
      style={[
        {
          minHeight: small ? 44 : 56,
          paddingHorizontal: small ? 16 : 22,
          borderRadius: small ? RADIUS.small + 2 : RADIUS.control + 2,
          backgroundColor: bg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={small ? 18 : 20} color={fg} />}
      <Txt v={small ? 'calloutBold' : 'bodyBold'} color={fg} style={!small && { fontSize: 17 }}>
        {title}
      </Txt>
    </Pressy>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  size = 44,
  tint,
  bg,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  size?: number;
  tint?: string;
  bg?: string;
}) {
  const { c } = useTheme();
  return (
    <Pressy
      onPress={onPress}
      label={label}
      hitSlop={6}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bg ?? c.surface2,
      }}
    >
      <Icon name={icon} size={Math.round(size * 0.5)} color={tint ?? c.ink} />
    </Pressy>
  );
}

/* ---------- Surfaces ---------- */

export function Card({ children, style, flat }: { children: ReactNode; style?: StyleProp<ViewStyle>; flat?: boolean }) {
  const t = useTheme();
  return (
    <View style={[{ backgroundColor: t.c.surface, borderRadius: RADIUS.card, padding: 18 }, !flat && t.elevated, style]}>{children}</View>
  );
}

export function SectionTitle({ title, aside, asideTone = 'ink2', id }: { title: string; aside?: string; asideTone?: Tone; id?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
      <Txt v="headline" accessibilityRole="header" nativeID={id}>
        {title}
      </Txt>
      {aside ? (
        <Txt v="calloutBold" tone={asideTone} style={{ fontVariant: ['tabular-nums'] }}>
          {aside}
        </Txt>
      ) : null}
    </View>
  );
}

/* ---------- Progress ---------- */

export function ProgressBar({
  value,
  color,
  track,
  height = 8,
  label,
}: {
  value: number;
  color?: string;
  track?: string;
  height?: number;
  label?: string;
}) {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const w = useSharedValue(0);
  useEffect(() => {
    const v = Math.max(0, Math.min(1, value));
    w.set(reduce ? v : withTiming(v, { duration: 900 }));
  }, [value, reduce, w]);
  const style = useAnimatedStyle(() => ({ width: `${Math.max(w.value > 0 ? 3 : 0, w.value * 100)}%` }));
  return (
    <View
      accessible={!!label}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
      style={{ height, borderRadius: height / 2, backgroundColor: track ?? c.surface2, overflow: 'hidden' }}
    >
      <Animated.View style={[{ height: '100%', borderRadius: height / 2, backgroundColor: color ?? c.followed }, style]} />
    </View>
  );
}

/* ---------- Segmented control ---------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: string; a11y?: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  const { c, dark } = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={{ flexDirection: 'row', backgroundColor: c.surface2, borderRadius: RADIUS.small + 2, padding: 3 }}
    >
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressy
            key={o.id}
            role="radio"
            label={o.a11y ?? o.label}
            state={{ selected: on, checked: on }}
            feedback="select"
            squash={0.97}
            hitSlop={3}
            onPress={() => onChange(o.id)}
            style={[
              {
                flex: 1,
                minHeight: 40,
                minWidth: 44,
                paddingHorizontal: 10,
                borderRadius: RADIUS.small,
                alignItems: 'center',
                justifyContent: 'center',
              },
              on && { backgroundColor: dark ? c.surface3 : c.surface, boxShadow: '0 1px 3px rgba(0,0,0,0.12)' },
            ]}
          >
            <Txt v="label" tone={on ? 'ink' : 'ink2'}>
              {o.label}
            </Txt>
          </Pressy>
        );
      })}
    </View>
  );
}

/* ---------- Chips ---------- */

export function Chip({
  label,
  icon,
  on,
  onPress,
  a11y,
}: {
  label: string;
  icon?: IconName;
  on?: boolean;
  onPress: () => void;
  a11y?: string;
}) {
  const { c } = useTheme();
  return (
    <Pressy
      onPress={onPress}
      label={a11y ?? label}
      state={on === undefined ? undefined : { selected: on }}
      feedback="select"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        minHeight: 44,
        paddingHorizontal: 13,
        borderRadius: RADIUS.pill,
        backgroundColor: on ? c.brandSoft : c.surface,
        borderWidth: 1.5,
        borderColor: on ? c.brandText : c.line,
      }}
    >
      {icon && <Icon name={icon} size={17} color={on ? c.brandText : c.ink2} />}
      <Txt v="calloutBold" tone={on ? 'brand' : 'ink'}>
        {label}
      </Txt>
    </Pressy>
  );
}

/* ---------- Rows ---------- */

export function Row({
  icon,
  title,
  sub,
  value,
  onPress,
  tint,
  last,
  right,
}: {
  icon?: IconName;
  title: string;
  sub?: string;
  value?: string;
  onPress?: () => void;
  tint?: string;
  last?: boolean;
  right?: ReactNode;
}) {
  const { c } = useTheme();
  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 56, paddingVertical: 10 }}>
      {icon && (
        <View
          style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name={icon} size={19} color={tint ?? c.ink2} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Txt v="bodyBold" color={tint === c.danger ? c.danger : undefined}>
          {title}
        </Txt>
        {sub ? (
          <Txt v="footnote" tone="ink2">
            {sub}
          </Txt>
        ) : null}
      </View>
      {value ? (
        <Txt v="calloutBold" tone="ink2">
          {value}
        </Txt>
      ) : null}
      {right}
      {onPress && !right ? <Icon name="chevron-right" size={18} color={c.ink3} /> : null}
    </View>
  );
  const sep = !last && { borderBottomWidth: 1, borderBottomColor: c.line };
  if (!onPress) return <View style={sep}>{body}</View>;
  return (
    <Pressy onPress={onPress} label={[title, sub, value].filter(Boolean).join(', ')} squash={0.985} style={sep}>
      {body}
    </Pressy>
  );
}
