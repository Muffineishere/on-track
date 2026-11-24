import { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { TimeOfDay } from '@/domain/dates';
import { SKIES, TUNAS } from '@/theme';

const STARS: [number, number, number][] = [
  [24, 74, 1.3],
  [62, 122, 1],
  [96, 62, 1.5],
  [140, 100, 1],
  [176, 58, 1.2],
  [214, 84, 1.4],
  [252, 136, 1],
  [276, 64, 1.1],
  [330, 110, 1.3],
  [362, 70, 1],
  [40, 168, 1.1],
  [196, 160, 1],
  [318, 180, 1.2],
  [118, 190, 1],
];

function cloud(x: number, y: number, s: number, fill: string, key: string) {
  return (
    <G key={key} transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <Ellipse cx={0} cy={0} rx={34} ry={12} />
      <Circle cx={-12} cy={-8} r={13} />
      <Circle cx={8} cy={-13} r={16} />
      <Circle cx={24} cy={-4} r={10} />
    </G>
  );
}

function tuft(x: number, y: number, s: number, key: string) {
  return (
    <G key={key} transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M0 0q-2-9-7-13M0 0q0-12 2-17M0 0q3-8 8-11" stroke={TUNAS.stem} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </G>
  );
}

function flower(x: number, y: number, col: string, key: string) {
  return (
    <G key={key} transform={`translate(${x} ${y})`}>
      <Path d="M0 0v-14" stroke={TUNAS.stem} strokeWidth={2} strokeLinecap="round" />
      {Array.from({ length: 5 }, (_, i) => {
        const a = ((i * 72 - 90) * Math.PI) / 180;
        return <Circle key={i} cx={Math.cos(a) * 3.6} cy={-16 + Math.sin(a) * 3.6} r={3.2} fill={col} />;
      })}
      <Circle cx={0} cy={-16} r={2.2} fill="#FFE3A3" />
    </G>
  );
}

/**
 * The sky behind Tunas follows the clock: peach mornings, clear days, dusky evenings and a
 * starry night. Three soft hills give depth; flowers appear on the front hill as Tunas grows.
 * Drawn on a 400 by 440 canvas and cropped to fill.
 */
export function Scene({ tod, stage, width, height }: { tod: TimeOfDay; stage: number; width: number; height: number }) {
  const sky = SKIES[tod];
  const id = 'sky' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const sun = tod === 'morning' ? [318, 196] : tod === 'day' ? [320, 132] : [318, 214];
  const ground = 296;
  const flora = [tuft(118, ground + 8, 1, 'a'), tuft(300, ground + 6, 0.9, 'b')];
  if (stage >= 2) flora.push(tuft(52, ground + 12, 0.85, 'c'), tuft(352, ground + 14, 1, 'd'));
  if (stage >= 3) flora.push(flower(84, ground + 10, TUNAS.petal, 'e'), flower(330, ground + 10, TUNAS.petal2, 'f'));
  if (stage >= 4) flora.push(flower(36, ground + 16, TUNAS.petal2, 'g'), flower(372, ground + 18, TUNAS.petal, 'h'));
  return (
    <Svg width={width} height={height} viewBox="0 0 400 440" preserveAspectRatio="xMidYMax slice" pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={sky.top} />
          <Stop offset="1" stopColor={sky.bottom} />
        </LinearGradient>
      </Defs>
      <Rect x={-200} y={-200} width={800} height={700} fill={`url(#${id})`} />
      {sky.night ? (
        <G>
          {STARS.map(([x, y, r], i) => (
            <Circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={i % 3 === 0 ? 0.5 : 0.85} />
          ))}
          <Circle cx={318} cy={140} r={34} fill="#F3F0DC" opacity={0.06} />
          <Path d="M318 118 A22 22 0 1 0 318 162 A17 22 0 1 1 318 118 Z" fill="#F3F0DC" transform="rotate(-24 318 140)" />
        </G>
      ) : (
        <G>
          <Circle cx={sun[0]} cy={sun[1]} r={38} fill={sky.sun ?? '#fff'} opacity={0.18} />
          <Circle cx={sun[0]} cy={sun[1]} r={22} fill={sky.sun ?? '#fff'} />
          {cloud(84, 150, 0.95, 'rgba(255,255,255,0.75)', 'c1')}
          {cloud(250, 210, 0.6, 'rgba(255,255,255,0.6)', 'c2')}
        </G>
      )}
      <Path d="M-200 284 C-60 240 60 266 150 274 C250 284 330 242 600 266 L600 500 L-200 500 Z" fill={sky.hills[0]} />
      <Path d="M-200 306 C-40 280 90 284 200 292 C300 300 380 276 600 290 L600 500 L-200 500 Z" fill={sky.hills[1]} />
      <Path d="M-200 328 C-20 306 120 296 200 298 C290 300 400 314 600 322 L600 500 L-200 500 Z" fill={sky.hills[2]} />
      {sky.night ? null : <G>{flora}</G>}
    </Svg>
  );
}
