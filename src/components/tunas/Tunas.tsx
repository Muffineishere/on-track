import { useEffect, useId, type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg from 'react-native-svg';

import type { Mood, OutfitId } from '@/domain/types';
import { useDataStore } from '@/store/data';
import type { TunasAnim } from '@/store/ui';

import { armLeft, armRight, body, cheeks, defs, effects, eyes, mouth, outfit, shadow, sprout } from './parts';

export interface TunasProps {
  stage: number;
  mood: Mood;
  outfit: OutfitId | null;
  size: number;
  /** Breathing, blinking and leaf sway. Off for small static pictures. */
  idle?: boolean;
  /** A one-off move; a new id replays it. */
  action?: { kind: TunasAnim; id: number } | null;
  /** Where Tunas looks, from -1 to 1 on each axis. */
  lookX?: SharedValue<number>;
  lookY?: SharedValue<number>;
  /** 0 to 1 while a finger is held on Tunas. */
  press?: SharedValue<number>;
  style?: ViewStyle;
}

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const t = (v: number, ms: number) => withTiming(v, { duration: ms, easing: ease });
const now = (v: number) => withTiming(v, { duration: 0 });

/** A static Tunas: one SVG, no animation. For lists, cards and small pictures. */
export function TunasStill({ stage, mood, outfit: o, size }: Pick<TunasProps, 'stage' | 'mood' | 'outfit' | 'size'>) {
  const id = useSvgId();
  const droop = mood === 'missed';
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" pointerEvents="none">
      {defs(id)}
      {shadow()}
      {effects(mood)}
      {sprout(id, stage, droop)}
      {body(id)}
      {outfit(o, 'back')}
      {armLeft(droop)}
      {armRight(droop)}
      {cheeks()}
      {eyes(mood)}
      {mouth(mood)}
      {outfit(o, 'front')}
    </Svg>
  );
}

function useSvgId() {
  return 't' + useId().replace(/[^a-zA-Z0-9]/g, '');
}

function Layer({ size, children, style }: { size: number; children: ReactNode; style?: object }) {
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {children}
      </Svg>
    </Animated.View>
  );
}

/** The living Tunas: each part is its own layer so it can breathe, blink, sway, look around and react. */
export function Tunas({ stage, mood, outfit: o, size, idle = true, action, lookX, lookY, press, style }: TunasProps) {
  const id = useSvgId();
  const systemReduce = useReducedMotion();
  const calm = useDataStore((s) => s.data.calm);
  const reduce = systemReduce || calm;
  const droop = mood === 'missed';
  const blinks = !['followed', 'poke', 'evening', 'pet', 'missed'].includes(mood) && o !== 'shades';
  const k = size / 200;

  const breathe = useSharedValue(0);
  const sway = useSharedValue(0);
  const blink = useSharedValue(0);
  const jy = useSharedValue(0);
  const sx = useSharedValue(1);
  const sy = useSharedValue(1);
  const flop = useSharedValue(0);
  const armL = useSharedValue(0);
  const armR = useSharedValue(0);
  const ownX = useSharedValue(0);
  const ownY = useSharedValue(0);
  const zero = useSharedValue(0);
  const lx = lookX ?? ownX;
  const ly = lookY ?? ownY;
  const pr = press ?? zero;

  useEffect(() => {
    if (!idle || reduce) {
      breathe.value = 0;
      sway.value = 0;
      return;
    }
    breathe.value = withRepeat(withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.sin) }), -1, true);
    sway.value = withSequence(
      withTiming(-1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      withRepeat(withTiming(1, { duration: droop ? 2200 : 1700, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
    return () => {
      cancelAnimation(breathe);
      cancelAnimation(sway);
    };
  }, [idle, reduce, droop, breathe, sway]);

  useEffect(() => {
    if (!idle || reduce || !blinks) {
      blink.value = 0;
      return;
    }
    blink.value = withRepeat(withSequence(withDelay(4200, withTiming(1, { duration: 70 })), withTiming(0, { duration: 110 })), -1);
    return () => cancelAnimation(blink);
  }, [idle, reduce, blinks, blink]);

  // Without someone to look at, Tunas glances around now and then.
  useEffect(() => {
    if (lookX || !idle || reduce) return;
    const timer = setInterval(() => {
      ownX.value = withTiming((Math.random() * 2 - 1) * 0.8, { duration: 380, easing: ease });
      ownY.value = withTiming((Math.random() * 2 - 1) * 0.5, { duration: 380, easing: ease });
    }, 3200);
    return () => clearInterval(timer);
  }, [lookX, idle, reduce, ownX, ownY]);

  useEffect(() => {
    if (!action || reduce) return;
    const { kind } = action;
    if (kind === 'jump') {
      jy.value = withSequence(now(0), t(-46, 270), t(-50, 225), t(0, 205), t(0, 200));
      sx.value = withSequence(now(1.12), t(0.92, 270), t(1, 225), t(1.1, 205), t(0.97, 110), t(1, 90));
      sy.value = withSequence(now(0.86), t(1.1, 270), t(1, 225), t(0.9, 205), t(1.03, 110), t(1, 90));
      flop.value = withSequence(t(-14, 225), t(10, 270), t(-4, 225), t(0, 180));
      armR.value = withSequence(t(-38, 225), t(-20, 225), t(-38, 225), t(0, 225));
      armL.value = withSequence(t(38, 225), t(20, 225), t(38, 225), t(0, 225));
    } else if (kind === 'nod') {
      jy.value = withSequence(now(0), t(-16, 280), t(0, 420));
      sx.value = withSequence(now(1.08), t(0.97, 280), t(1, 420));
      sy.value = withSequence(now(0.9), t(1.04, 280), t(1, 420));
    } else if (kind === 'boing') {
      sx.value = withSequence(now(1.14), t(0.94, 220), t(1.03, 165), t(1, 165));
      sy.value = withSequence(now(0.84), t(1.08, 220), t(0.97, 165), t(1, 165));
      flop.value = withSequence(t(-14, 150), t(10, 180), t(-4, 150), t(0, 120));
    } else if (kind === 'wave') {
      armR.value = withSequence(t(-38, 225), t(-20, 225), t(-38, 225), t(0, 225));
      armL.value = withSequence(t(38, 225), t(20, 225), t(38, 225), t(0, 225));
    }
  }, [action, reduce, jy, sx, sy, flop, armL, armR]);

  const shadowStyle = useAnimatedStyle(() => ({
    transformOrigin: '50% 94%',
    transform: [{ scaleX: 1 + jy.value / 160 }],
    opacity: 1 + jy.value / 120,
  }));
  const bodyStyle = useAnimatedStyle(() => ({
    transformOrigin: '50% 93%',
    transform: [
      { translateY: jy.value * k },
      { rotate: `${droop ? sway.value * 1.5 : 0}deg` },
      { scaleX: (1 + (droop ? 0 : 0.018) * breathe.value) * sx.value * (1 + 0.06 * pr.value) },
      { scaleY: (1 - (droop ? 0 : 0.018) * breathe.value) * sy.value * (1 - 0.1 * pr.value) },
    ],
  }));
  const sproutStyle = useAnimatedStyle(() => ({
    transformOrigin: '50% 42%',
    transform: [{ rotate: `${(droop ? 0 : sway.value * 3) + flop.value}deg` }],
  }));
  const eyeStyle = useAnimatedStyle(() => ({
    transformOrigin: '50% 60.5%',
    transform: [{ translateX: lx.value * 4.5 * k }, { translateY: ly.value * 3.5 * k }, { scaleY: 1 - 0.92 * blink.value }],
  }));
  const armLStyle = useAnimatedStyle(() => ({ transformOrigin: '26% 70%', transform: [{ rotate: `${armL.value}deg` }] }));
  const armRStyle = useAnimatedStyle(() => ({ transformOrigin: '74% 70%', transform: [{ rotate: `${armR.value}deg` }] }));

  return (
    <View pointerEvents="none" style={[{ width: size, height: size }, style]}>
      <Layer size={size} style={shadowStyle}>
        {shadow()}
      </Layer>
      <Layer size={size}>{effects(mood)}</Layer>
      <Animated.View style={[StyleSheet.absoluteFill, bodyStyle]}>
        <Layer size={size} style={sproutStyle}>
          {defs(id + 's')}
          {sprout(id + 's', stage, droop)}
        </Layer>
        <Layer size={size}>
          {defs(id)}
          {body(id)}
          {outfit(o, 'back')}
        </Layer>
        <Layer size={size} style={armLStyle}>
          {armLeft(droop)}
        </Layer>
        <Layer size={size} style={armRStyle}>
          {armRight(droop)}
        </Layer>
        <Layer size={size}>
          {cheeks()}
          {mouth(mood)}
        </Layer>
        <Layer size={size} style={eyeStyle}>
          {eyes(mood)}
        </Layer>
        <Layer size={size}>{outfit(o, 'front')}</Layer>
      </Animated.View>
    </View>
  );
}
