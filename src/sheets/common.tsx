import { useEffect, useRef, useState, type ReactNode } from 'react';
import { TextInput, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { Pressy, Txt } from '@/components/ui';
import { SLIPS } from '@/domain/content';
import type { SlipId } from '@/domain/types';
import { haptic } from '@/lib/haptics';
import { FONT, RADIUS, useTheme } from '@/theme';

export function SheetHeader({ title, sub, art }: { title: string; sub?: string; art?: ReactNode }) {
  return (
    <View style={{ alignItems: 'center', gap: 6, paddingTop: 4 }}>
      {art}
      <Txt v="title" center accessibilityRole="header">
        {title}
      </Txt>
      {sub ? (
        <Txt v="callout" tone="ink2" center style={{ maxWidth: 340 }}>
          {sub}
        </Txt>
      ) : null}
    </View>
  );
}

/** Slip reasons as chips; tapping the chosen one again clears it. */
export function SlipChips({ value, onPick }: { value?: SlipId; onPick: (id: SlipId) => void }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {SLIPS.map((s) => {
        const on = s.id === value;
        return (
          <Pressy
            key={s.id}
            label={s.label}
            state={{ selected: on }}
            feedback="select"
            onPress={() => onPick(s.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 7,
              minHeight: 44,
              paddingLeft: 8,
              paddingRight: 13,
              borderRadius: RADIUS.pill,
              backgroundColor: on ? c.brandSoft : c.surface,
              borderWidth: 1.5,
              borderColor: on ? c.brandText : c.line,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: on ? c.brand : c.surface2,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={s.icon} size={16} color={on ? c.onBrand : c.ink2} />
            </View>
            <Txt v="calloutBold" tone={on ? 'brand' : 'ink'}>
              {s.label}
            </Txt>
          </Pressy>
        );
      })}
    </View>
  );
}

/** A step button that repeats while held, like the iOS stepper. */
function StepButton({ icon, label, onStep }: { icon: 'minus' | 'plus'; label: string; onStep: () => void }) {
  const { c } = useTheme();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rep = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    if (rep.current) clearInterval(rep.current);
    timer.current = rep.current = null;
  };
  useEffect(() => stop, []);
  return (
    <Pressy
      label={label}
      feedback="none"
      onPress={() => {
        if (!rep.current) onStep();
        haptic.select();
      }}
      onLongPress={() => {
        rep.current = setInterval(onStep, 70);
      }}
      delayLongPress={380}
      onPressOut={stop}
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: c.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: c.line,
      }}
    >
      <Icon name={icon} size={24} color={c.ink} />
    </Pressy>
  );
}

/** A big kilogram field with minus and plus steps of 0.1 kg. */
export function KgField({
  value,
  onChange,
  label,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  onSubmit: () => void;
}) {
  const { c } = useTheme();
  const step = (d: number) => {
    const n = parseFloat(value.replace(',', '.'));
    const base = Number.isFinite(n) ? n : 65;
    onChange(Math.min(300, Math.max(25, Math.round((base + d) * 10) / 10)).toFixed(1));
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <StepButton icon="minus" label="Less 0.1 kilograms" onStep={() => step(-0.1)} />
      <View
        style={{
          width: 172,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          paddingHorizontal: 10,
          borderRadius: RADIUS.tile,
          backgroundColor: c.surface,
          borderWidth: 1,
          borderColor: c.line,
        }}
      >
        <TextInput
          value={value}
          onChangeText={(t) => onChange(t.replace(/[^0-9.,]/g, '').slice(0, 5))}
          keyboardType="decimal-pad"
          inputMode="decimal"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          accessibilityLabel={label}
          placeholder="65.0"
          placeholderTextColor={c.ink3}
          selectTextOnFocus
          style={{
            width: 112,
            fontFamily: FONT.black,
            fontSize: 40,
            color: c.ink,
            textAlign: 'center',
            paddingVertical: 10,
            paddingHorizontal: 0,
            fontVariant: ['tabular-nums'],
          }}
        />
        <Txt v="headline" tone="ink2">
          kg
        </Txt>
      </View>
      <StepButton icon="plus" label="Add 0.1 kilograms" onStep={() => step(0.1)} />
    </View>
  );
}

/** Counts from one number to another over a short ease-out, or jumps with reduced motion. */
export function useCountUp(from: number, to: number, delay = 300, ms = 700) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(from);
  const skip = reduce || from === to;
  useEffect(() => {
    if (skip) return;
    let raf = 0;
    const start = setTimeout(() => {
      const t0 = Date.now();
      const tick = () => {
        const p = Math.min(1, (Date.now() - t0) / ms);
        setV(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(start);
      cancelAnimationFrame(raf);
    };
  }, [from, to, delay, ms, skip]);
  return skip ? to : v;
}
