import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import Animated, { Easing, FadeIn, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { Scene } from '@/components/Scene';
import { Tunas } from '@/components/tunas/Tunas';
import { ProgressBar, Txt } from '@/components/ui';
import { LINES, STAGES } from '@/domain/content';
import { timeOfDay } from '@/domain/dates';
import { pickRandom, plural } from '@/domain/lines';
import type { Growth } from '@/domain/stage';
import type { Mood, OutfitId } from '@/domain/types';
import { haptic } from '@/lib/haptics';
import { useDataStore } from '@/store/data';
import { useUI, type TunasAnim } from '@/store/ui';
import { RADIUS, SKIES, TUNAS, useTheme } from '@/theme';

const TUNAS_SIZE = 164;
const HEIGHT = 424;
/** Space kept clear at the bottom for the growth card. */
const CARD_SPACE = 140;

function Heart({ x, delay, dx }: { x: number; delay: number; dx: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    const t = setTimeout(() => {
      p.set(withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) }));
    }, delay);
    return () => clearTimeout(t);
  }, [p, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: p.value < 0.2 ? p.value * 5 : 1 - (p.value - 0.2) / 0.8,
    transform: [{ translateX: dx * p.value * 2 }, { translateY: -90 * p.value }, { scale: 0.5 + 0.5 * Math.min(1, p.value * 4) }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: x, top: 40 }, style]}>
      <Icon name="heart" size={24} color={TUNAS.heart} />
    </Animated.View>
  );
}

/**
 * Tunas in its sky. Tap to say hi, hold for a cuddle, and Tunas follows your finger
 * (or mouse) with its eyes. The bubble says something about the day.
 */
export function Hero({
  stage,
  mood,
  outfit,
  line,
  growth,
  now,
}: {
  stage: number;
  mood: Mood;
  outfit: OutfitId | null;
  line: string;
  growth: Growth;
  now: Date;
}) {
  const { c, dark } = useTheme();
  const calm = useDataStore((s) => s.data.calm);
  const reduce = useReducedMotion() || calm;
  const tod = timeOfDay(now);
  const sky = SKIES[tod];
  const [width, setWidth] = useState(0);
  const [said, setSaid] = useState<string | null>(null);
  const [face, setFace] = useState<Mood | null>(null);
  const [action, setAction] = useState<{ kind: TunasAnim; id: number } | null>(null);
  const [hearts, setHearts] = useState<{ id: number; x: number; dx: number; delay: number }[]>([]);
  const lookX = useSharedValue(0);
  const lookY = useSharedValue(0);
  const press = useSharedValue(0);
  const lastTouch = useRef(0);
  const center = useRef({ x: 0, y: 0 });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const seq = useRef(1);
  const reaction = useUI((s) => s.tunas);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const play = (kind?: TunasAnim, text?: string, faceMood?: Mood, heartCount = 0, ms = 2400) => {
    if (kind) setAction({ kind, id: seq.current++ });
    if (text) setSaid(text);
    if (faceMood) setFace(faceMood);
    if (heartCount) {
      const base = seq.current * 10;
      setHearts((h) => [
        ...h,
        ...Array.from({ length: heartCount }, (_, i) => ({
          id: base + i,
          x: width / 2 - 60 + Math.random() * 120,
          dx: (Math.random() * 2 - 1) * 16,
          delay: i * 110,
        })),
      ]);
      later(() => setHearts((h) => h.filter((x) => x.id < base || x.id >= base + heartCount)), 1400 + heartCount * 110);
    }
    later(() => setFace(null), Math.min(ms, 2200));
    if (text) later(() => setSaid((cur) => (cur === text ? null : cur)), ms + 1600);
  };

  // Reactions sent from elsewhere: a check-in, a completed list, a new stage.
  useEffect(() => {
    if (reaction) play(reaction.anim, reaction.line, undefined, reaction.hearts ?? 0, 3600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reaction?.id]);

  // When nobody is pointing, Tunas glances around now and then.
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      if (Date.now() - lastTouch.current < 2500) return;
      lookX.set(withTiming((Math.random() * 2 - 1) * 0.8, { duration: 380 }));
      lookY.set(withTiming((Math.random() * 2 - 1) * 0.5, { duration: 380 }));
    }, 3200);
    return () => clearInterval(id);
  }, [reduce, lookX, lookY]);

  const follow = (x: number, y: number) => {
    if (reduce) return;
    const dx = x - center.current.x;
    const dy = y - center.current.y;
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 150);
    lastTouch.current = Date.now();
    lookX.set(withTiming((dx / d) * k, { duration: 120 }));
    lookY.set(withTiming((dy / d) * k, { duration: 120 }));
  };
  const heroRef = useRef<ComponentRef<typeof View>>(null);
  const origin = useRef({ x: 0, y: 0 });
  const measure = () => heroRef.current?.measureInWindow((x, y) => (origin.current = { x, y }));
  const onMove = (e: GestureResponderEvent) => follow(e.nativeEvent.pageX - origin.current.x, e.nativeEvent.pageY - origin.current.y);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidth(w);
    measure();
    center.current = { x: w / 2, y: HEIGHT - CARD_SPACE - TUNAS_SIZE * 0.4 };
  };

  const text = said ?? line;
  const st = STAGES[growth.stage];

  return (
    <View
      ref={heroRef}
      onLayout={onLayout}
      style={{ height: HEIGHT, borderRadius: RADIUS.card + 4, overflow: 'hidden', backgroundColor: sky.bottom }}
      // Web: follow the mouse. Phones: follow the finger while it moves over the scene.
      {...({
        onPointerEnter: measure,
        onPointerMove: (e: { nativeEvent: { clientX?: number; clientY?: number } }) => {
          const n = e.nativeEvent;
          if (n.clientX != null && n.clientY != null) follow(n.clientX - origin.current.x, n.clientY - origin.current.y);
        },
      } as object)}
      onTouchMove={onMove}
    >
      {width ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Scene tod={tod} stage={stage} width={width} height={HEIGHT} />
        </View>
      ) : null}

      <View style={{ alignItems: 'center', paddingTop: 18, paddingHorizontal: 22 }} pointerEvents="none">
        <Animated.View
          key={text}
          entering={reduce ? undefined : FadeIn.duration(260)}
          accessibilityLiveRegion="polite"
          style={{
            maxWidth: 300,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 18,
            backgroundColor: dark ? '#F4F1EA' : '#FFFFFF',
            boxShadow: '0 4px 14px rgba(20,30,25,0.12)',
          }}
        >
          <Txt v="bodyBold" color="#1D2621" center>
            {text}
          </Txt>
          <View
            style={{
              position: 'absolute',
              bottom: -6,
              left: '50%',
              marginLeft: -7,
              width: 14,
              height: 14,
              backgroundColor: dark ? '#F4F1EA' : '#FFFFFF',
              transform: [{ rotate: '45deg' }],
              borderRadius: 3,
            }}
          />
        </Animated.View>
      </View>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: CARD_SPACE, alignItems: 'center' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Tunas, ${st.label}. Tap to say hi, hold for a cuddle.`}
          onPressIn={() => {
            press.set(withTiming(1, { duration: 180 }));
          }}
          onPressOut={() => {
            press.set(withTiming(0, { duration: 220 }));
          }}
          onPress={() => {
            haptic.tap();
            play('boing', pickRandom(LINES.poke), 'poke', 1, 1500);
          }}
          onLongPress={() => {
            haptic.success();
            play('wave', pickRandom(LINES.pet), 'pet', 5, 2200);
          }}
          delayLongPress={450}
          onTouchStart={(e) => {
            measure();
            onMove(e);
          }}
          style={{ width: TUNAS_SIZE, height: TUNAS_SIZE, cursor: 'pointer' } as object}
        >
          <Tunas
            stage={stage}
            mood={face ?? mood}
            outfit={outfit}
            size={TUNAS_SIZE}
            action={action}
            lookX={lookX}
            lookY={lookY}
            press={press}
          />
        </Pressable>
        {hearts.map((h) => (
          <Heart key={h.id} x={h.x} dx={h.dx} delay={h.delay} />
        ))}
      </View>

      <View
        style={{
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 14,
          padding: 14,
          paddingTop: 12,
          borderRadius: RADIUS.tile,
          backgroundColor: dark ? 'rgba(22,29,26,0.88)' : 'rgba(255,255,255,0.9)',
          gap: 8,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Txt v="bodyBold">{st.label}</Txt>
          <Txt v="calloutBold" tone="ink2" style={{ fontVariant: ['tabular-nums'] }}>
            {growth.nextAt ? `${growth.nextAt - growth.toNext} / ${growth.nextAt}` : 'Fully grown'}
          </Txt>
        </View>
        <ProgressBar
          value={growth.progress}
          color={c.followed}
          label={`Growth toward the next stage: ${Math.round(growth.progress * 100)}%`}
        />
        <Txt v="footnote" tone="ink2">
          {growth.nextAt ? `${plural(growth.toNext, 'more good day')} until Tunas can ${st.next}.` : 'Every good day keeps Tunas thriving.'}
        </Txt>
      </View>
    </View>
  );
}
