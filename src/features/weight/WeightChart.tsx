import { useId, useMemo, useState } from 'react';
import { View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import { Txt } from '@/components/ui';
import { addDays, daysBetween, formatShort, formatShortDay, fromKey, startOfDay } from '@/domain/dates';
import { formatKg, type TrendPoint } from '@/domain/weight';
import { FONT, useTheme } from '@/theme';

export type Range = '1m' | '3m' | 'all';

const H = 200;
const PAD = { l: 40, r: 12, t: 16, b: 26 };

/** A smooth curve through the points (Catmull-Rom turned into cubic Béziers). */
function smooth(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return '';
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

/**
 * Weigh-ins as hollow dots with the smoothed trend as one confident line on top, so the
 * eye reads direction rather than daily noise. Drag across it to read any weigh-in.
 */
export function WeightChart({
  series,
  goal,
  range,
  width,
  now,
}: {
  series: TrendPoint[];
  goal: number | null;
  range: Range;
  width: number;
  now: Date;
}) {
  const { c } = useTheme();
  const gid = 'wg' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [sel, setSel] = useState<number | null>(null);

  const model = useMemo(() => {
    const span0 = daysBetween(fromKey(series[0].d), fromKey(series[series.length - 1].d));
    let pts = series;
    const days = span0 > 31 ? (range === '1m' ? 31 : range === '3m' ? 92 : null) : null;
    if (days) {
      const from = addDays(startOfDay(now), -days);
      pts = series.filter((p) => fromKey(p.d) >= from);
      if (pts.length < 2) pts = series.slice(-2);
    }
    const d0 = fromKey(pts[0].d);
    const d1 = fromKey(pts[pts.length - 1].d);
    const span = Math.max(6, daysBetween(d0, d1));
    const vals = pts.flatMap((p) => [p.kg, p.tr]);
    const dmin = Math.min(...vals);
    const dmax = Math.max(...vals);
    const goalIn = goal != null && goal > dmin - 5 && goal < dmax + 5;
    if (goalIn && goal != null) vals.push(goal);
    let lo = Math.floor((Math.min(...vals) - 0.4) * 2) / 2;
    let hi = Math.ceil((Math.max(...vals) + 0.4) * 2) / 2;
    if (hi - lo < 2) {
      const mid = (hi + lo) / 2;
      lo = Math.floor((mid - 1) * 2) / 2;
      hi = lo + 2;
    }
    const X = (k: string) => PAD.l + ((width - PAD.l - PAD.r) * daysBetween(d0, fromKey(k))) / span;
    const Y = (v: number) => PAD.t + ((H - PAD.t - PAD.b) * (hi - v)) / (hi - lo);
    const trend = pts.map((p) => ({ x: X(p.d), y: Y(p.tr) }));
    const line = smooth(trend);
    const area = `${line} L${trend[trend.length - 1].x},${H - PAD.b} L${trend[0].x},${H - PAD.b} Z`;
    return { pts, lo, hi, X, Y, line, area, goalIn, d0, d1 };
  }, [series, range, width, goal, now]);

  const pan = usePanGesture({
    runOnJS: true,
    activeOffsetX: [-6, 6],
    failOffsetY: [-14, 14],
    onBegin: (e) => pickAt(e.x),
    onUpdate: (e) => pickAt(e.x),
    onFinalize: () => setSel(null),
  });

  function pickAt(x: number) {
    let best = 0;
    model.pts.forEach((p, i) => {
      if (Math.abs(model.X(p.d) - x) < Math.abs(model.X(model.pts[best].d) - x)) best = i;
    });
    setSel(best);
  }

  const { pts, lo, hi, X, Y } = model;
  const last = pts[pts.length - 1];
  const s = sel != null ? pts[sel] : null;
  const latest = series[series.length - 1];
  const tick = (v: number) => (
    <G key={v}>
      <Line x1={PAD.l} x2={width - PAD.r} y1={Y(v)} y2={Y(v)} stroke={c.line} strokeWidth={1} />
      <SvgText x={PAD.l - 8} y={Y(v) + 4} textAnchor="end" fontSize={11} fontFamily={FONT.bold} fill={c.ink3}>
        {formatKg(v)}
      </SvgText>
    </G>
  );
  return (
    <View>
      <GestureDetector gesture={pan}>
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={`Weight trend from ${formatShort(model.d0)} to ${formatShort(model.d1)}, now ${formatKg(last.tr)} kilograms.`}
        >
          <Svg width={width} height={H}>
            <Defs>
              <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={c.followed} stopOpacity={0.22} />
                <Stop offset="1" stopColor={c.followed} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            {[lo, (lo + hi) / 2, hi].map(tick)}
            {model.goalIn && goal != null ? (
              <G>
                <Line
                  x1={PAD.l}
                  x2={width - PAD.r}
                  y1={Y(goal)}
                  y2={Y(goal)}
                  stroke={c.mostlyText}
                  strokeWidth={1.5}
                  strokeDasharray="5 6"
                  strokeLinecap="round"
                />
                <SvgText x={width - PAD.r} y={Y(goal) - 6} textAnchor="end" fontSize={11} fontFamily={FONT.heavy} fill={c.mostlyText}>
                  Goal
                </SvgText>
              </G>
            ) : null}
            <Path d={model.area} fill={`url(#${gid})`} />
            {pts.map((p) => (
              <Circle key={p.d} cx={X(p.d)} cy={Y(p.kg)} r={3.5} fill={c.surface} stroke={c.ink3} strokeWidth={1.5} />
            ))}
            <Path d={model.line} fill="none" stroke={c.brandText} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={X(last.d)} cy={Y(last.tr)} r={6.5} fill={c.surface} stroke={c.brandText} strokeWidth={3.5} />
            {s ? (
              <G>
                <Line x1={X(s.d)} x2={X(s.d)} y1={PAD.t} y2={H - PAD.b} stroke={c.ink3} strokeWidth={1.5} strokeDasharray="3 4" />
                <Circle cx={X(s.d)} cy={Y(s.kg)} r={6} fill={c.ink} stroke={c.surface} strokeWidth={2.5} />
              </G>
            ) : null}
            <SvgText x={PAD.l} y={H - 6} fontSize={11} fontFamily={FONT.bold} fill={c.ink3}>
              {formatShort(model.d0)}
            </SvgText>
            <SvgText x={width - PAD.r} y={H - 6} textAnchor="end" fontSize={11} fontFamily={FONT.bold} fill={c.ink3}>
              {formatShort(model.d1)}
            </SvgText>
          </Svg>
        </View>
      </GestureDetector>
      <Txt v="footnote" tone="ink2" accessibilityLiveRegion="polite" style={{ marginTop: 6, minHeight: 18 }}>
        {s ? (
          <>
            {formatShortDay(fromKey(s.d))}: <Txt v="label">{formatKg(s.kg)} kg</Txt>, trend {formatKg(s.tr)} kg
          </>
        ) : (
          <>
            Latest <Txt v="label">{formatKg(latest.kg)} kg</Txt> on {formatShortDay(fromKey(latest.d))}. Drag across the chart to read any
            day.
          </>
        )}
      </Txt>
    </View>
  );
}
