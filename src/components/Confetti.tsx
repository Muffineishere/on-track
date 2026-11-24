import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { TUNAS } from '@/theme';

/** Small seeded generator so each burst is varied but rendering stays pure. */
function seeded(seed: number) {
  let s = (seed % 2147483646) + 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const COLORS = [TUNAS.petal, TUNAS.petal2, '#5DB07D', '#F5D27A', TUNAS.hi, '#E9A3C0'];

interface Bit {
  vx: number;
  vy: number;
  size: number;
  spin: number;
  color: string;
  shape: 0 | 1 | 2;
}

function Particle({ b, p, x0, y0 }: { b: Bit; p: SharedValue<number>; x0: number; y0: number }) {
  const style = useAnimatedStyle(() => {
    const t = p.value * 1.7;
    return {
      opacity: 1 - p.value * p.value,
      transform: [
        { translateX: x0 + b.vx * t * 60 },
        { translateY: y0 + (b.vy * t + 9 * t * t) * 60 },
        { rotate: `${b.spin * t * 360}deg` },
      ],
    };
  });
  const shape =
    b.shape === 0
      ? { width: b.size, height: b.size, borderRadius: b.size / 2 }
      : b.shape === 1
        ? { width: b.size * 1.5, height: b.size * 0.7, borderRadius: b.size }
        : { width: b.size * 1.2, height: b.size * 0.5, borderRadius: 2 };
  return <Animated.View style={[{ position: 'absolute', left: 0, top: 0, backgroundColor: b.color }, shape, style]} />;
}

/** A burst of petals and confetti from a point. A new `burst` number fires again. Silent with reduced motion. */
export function Confetti({ burst, x, y, count = 56 }: { burst: number; x: number; y: number; count?: number }) {
  const reduce = useReducedMotion();
  const p = useSharedValue(1);
  const bits = useMemo<Bit[]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        const rnd = seeded(burst * 997 + i);
        const ang = -Math.PI / 2 + (rnd() - 0.5) * 2.2;
        const sp = 5 + rnd() * 6;
        return {
          vx: Math.cos(ang) * sp * 0.9,
          vy: Math.sin(ang) * sp,
          size: 7 + rnd() * 6,
          spin: (rnd() - 0.5) * 2,
          color: COLORS[i % COLORS.length],
          shape: (i % 3) as 0 | 1 | 2,
        };
      }),
    [burst, count],
  );
  useEffect(() => {
    if (!burst || reduce) return;
    p.set(0);
    p.set(withTiming(1, { duration: 1700, easing: Easing.out(Easing.quad) }));
  }, [burst, reduce, p]);
  if (!burst || reduce) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {bits.map((b, i) => (
        <Particle key={`${burst}-${i}`} b={b} p={p} x0={x} y0={y} />
      ))}
    </View>
  );
}
