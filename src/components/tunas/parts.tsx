import type { ReactNode } from 'react';
import { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';

import type { Mood, OutfitId } from '@/domain/types';
import { FONT, TUNAS } from '@/theme';

/**
 * Tunas, drawn on a 200 by 200 grid. Each function returns one layer so the animated
 * version can move the sprout, arms and eyes independently.
 */
const INK = TUNAS.ink;

export function defs(id: string) {
  return (
    <Defs>
      <RadialGradient id={`${id}b`} cx="38%" cy="30%" r="78%">
        <Stop offset="0" stopColor={TUNAS.hi} />
        <Stop offset="0.55" stopColor={TUNAS.body} />
        <Stop offset="1" stopColor={TUNAS.lo} />
      </RadialGradient>
      <LinearGradient id={`${id}l`} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={TUNAS.hi} />
        <Stop offset="1" stopColor={TUNAS.body} />
      </LinearGradient>
    </Defs>
  );
}

const oEye = (x: number) => (
  <G key={`o${x}`}>
    <Ellipse cx={x} cy={121} rx={7} ry={8.5} fill={INK} />
    <Circle cx={x + 2.6} cy={117.5} r={2.8} fill="#fff" />
    <Circle cx={x - 2.4} cy={124.5} r={1.2} fill="#fff" opacity={0.7} />
  </G>
);
const lidEye = (x: number) => (
  <G key={`l${x}`}>
    <Path d={`M${x - 8} 121 Q${x} 129 ${x + 8} 121 Z`} fill={INK} />
    <Path d={`M${x - 9} 120.5 L${x + 9} 120.5`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
  </G>
);
const happyEye = (x: number) => (
  <Path key={`h${x}`} d={`M${x - 8} 124 Q${x} 113 ${x + 8} 124`} stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none" />
);
const sadEye = (x: number) => (
  <Path key={`s${x}`} d={`M${x - 8} 121 Q${x} 128 ${x + 8} 121`} stroke={INK} strokeWidth={4.5} strokeLinecap="round" fill="none" />
);

export function eyes(mood: Mood): ReactNode {
  switch (mood) {
    case 'followed':
    case 'poke':
    case 'pet':
      return [happyEye(80), happyEye(120)];
    case 'mostly':
      return [oEye(80), happyEye(120)];
    case 'missed':
      return [sadEye(80), sadEye(120)];
    case 'evening':
      return [lidEye(80), lidEye(120)];
    default:
      return [oEye(80), oEye(120)];
  }
}

export function mouth(mood: Mood): ReactNode {
  switch (mood) {
    case 'followed':
      return (
        <G>
          <Path d="M86 138 Q100 162 114 138 Q100 142 86 138 Z" fill={INK} />
          <Path d="M93 149 Q100 156 107 149 Q100 146 93 149 Z" fill="#F08F7E" />
        </G>
      );
    case 'mostly':
      return <Path d="M89 141 Q100 152 111 141" stroke={INK} strokeWidth={4.5} strokeLinecap="round" fill="none" />;
    case 'missed':
      return <Path d="M93 147 Q100 143 107 147" stroke={INK} strokeWidth={4.5} strokeLinecap="round" fill="none" />;
    case 'poke':
      return <Ellipse cx={100} cy={145} rx={6} ry={7} fill={INK} />;
    case 'pet':
      return <Path d="M88 140 Q100 156 112 140" stroke={INK} strokeWidth={4.5} strokeLinecap="round" fill="none" />;
    case 'evening':
      return <Ellipse cx={100} cy={146} rx={5} ry={6.5} fill={INK} />;
    default:
      return <Path d="M91 141 Q100 149 109 141" stroke={INK} strokeWidth={4.5} strokeLinecap="round" fill="none" />;
  }
}

function leaf(id: string, x: number, y: number, rot: number, len: number, key: string) {
  return (
    <G key={key} transform={`rotate(${rot} ${x} ${y})`}>
      <Path
        d={`M${x - len} ${y} Q${x} ${y - len * 0.75} ${x + len} ${y} Q${x} ${y + len * 0.75} ${x - len} ${y} Z`}
        fill={`url(#${id}l)`}
      />
      <Path d={`M${x - len + 3} ${y} L${x + len - 4} ${y}`} stroke={TUNAS.stem} strokeWidth={1.6} strokeLinecap="round" opacity={0.55} />
    </G>
  );
}

/** The sprout on Tunas's head grows with each stage. */
export function sprout(id: string, stage: number, droop: boolean): ReactNode {
  if (stage === 0) return <Path d="M100 82 Q104 74 99 69" stroke={TUNAS.stem} strokeWidth={5} strokeLinecap="round" fill="none" />;
  const st = stage >= 2 ? 50 : 62;
  const L = stage >= 2 ? 19 : 16;
  const parts: ReactNode[] = [
    <Path
      key="stem"
      d={`M100 84 Q${droop ? 107 : 97} 70 100 ${st}`}
      stroke={TUNAS.stem}
      strokeWidth={5}
      strokeLinecap="round"
      fill="none"
    />,
  ];
  if (stage >= 4) {
    parts.push(
      leaf(id, 80, 76, droop ? -110 : -150, 13, 'a'),
      leaf(id, 120, 76, droop ? 110 : 150, 13, 'b'),
      leaf(id, 80, 60, droop ? -70 : -20, 13, 'c'),
      leaf(id, 120, 60, droop ? 70 : 20, 13, 'd'),
    );
  }
  parts.push(
    <G key="l1" transform={`translate(${-L + 2} 0)`}>
      {leaf(id, 100, st + 2, droop ? -70 : -28, L, 'x')}
    </G>,
  );
  if (stage >= 2) {
    parts.push(
      <G key="l2" transform={`translate(${L - 2} 0)`}>
        {leaf(id, 100, st + 2, droop ? 70 : 28, L, 'y')}
      </G>,
    );
  }
  if (stage >= 3) {
    const fy = st - 7;
    const petals = Array.from({ length: 5 }, (_, i) => {
      const a = ((i * 72 - 90) * Math.PI) / 180;
      return <Circle key={i} cx={100 + Math.cos(a) * 8.5} cy={fy + Math.sin(a) * 8.5} r={7} fill={TUNAS.petal} />;
    });
    parts.push(
      <G key="fl" transform={droop ? `rotate(28 100 ${st})` : undefined}>
        {petals}
        <Circle cx={100} cy={fy} r={5.5} fill="#EE8A5E" />
      </G>,
    );
  }
  return parts;
}

export function shadow() {
  return <Ellipse cx={100} cy={188} rx={50} ry={7} fill="#0A1A10" opacity={0.16} />;
}

export function body(id: string) {
  return (
    <G>
      <Ellipse cx={80} cy={180} rx={15} ry={8} fill={TUNAS.lo} />
      <Ellipse cx={120} cy={180} rx={15} ry={8} fill={TUNAS.lo} />
      <Path
        d="M100 80 C140 80 160 108 160 136 C160 164 134 182 100 182 C66 182 40 164 40 136 C40 108 60 80 100 80 Z"
        fill={`url(#${id}b)`}
      />
      <Ellipse cx={100} cy={152} rx={35} ry={25} fill={TUNAS.belly} opacity={0.85} />
      <Ellipse cx={72} cy={101} rx={13} ry={7} fill="#fff" opacity={0.35} transform="rotate(-28 72 101)" />
    </G>
  );
}

export const armLeft = (droop: boolean) => (
  <Ellipse cx={44} cy={146} rx={8} ry={13} fill={TUNAS.lo} transform={`rotate(${droop ? 12 : -24} 44 146)`} />
);
export const armRight = (droop: boolean) => (
  <Ellipse cx={156} cy={146} rx={8} ry={13} fill={TUNAS.lo} transform={`rotate(${droop ? -12 : 24} 156 146)`} />
);

export function cheeks() {
  return (
    <G>
      <Ellipse cx={68} cy={137} rx={9} ry={6} fill={TUNAS.cheek} opacity={0.55} />
      <Ellipse cx={132} cy={137} rx={9} ry={6} fill={TUNAS.cheek} opacity={0.55} />
    </G>
  );
}

const star = (x: number, y: number, s: number) =>
  `M${x} ${y} l${s * 0.4} ${s} ${s} ${s * 0.4} -${s} ${s * 0.4} -${s * 0.4} ${s} -${s * 0.4} -${s} -${s} -${s * 0.4} ${s} -${s * 0.4}z`;
const heartPath = (x: number, y: number) => `M${x} ${y}c-3-4-9-1-6 4l6 6 6-6c3-5-3-8-6-4z`;

/** Effects around Tunas: sparkles when happy, sleepy z's in the evening, hearts when cuddled. */
export function effects(mood: Mood): ReactNode {
  if (mood === 'followed') {
    return (
      <G fill={TUNAS.petal}>
        <Path d={star(36, 72, 8)} />
        <Path d={star(164, 98, 6)} />
        <Circle cx={154} cy={62} r={3.5} />
        <Circle cx={48} cy={112} r={2.5} />
      </G>
    );
  }
  if (mood === 'missed' || mood === 'evening') {
    return (
      <G fill="#6B7A72" fontFamily={FONT.black}>
        <SvgText x={148} y={88} fontSize={18}>
          z
        </SvgText>
        <SvgText x={161} y={71} fontSize={13}>
          z
        </SvgText>
      </G>
    );
  }
  if (mood === 'pet') {
    return (
      <G fill={TUNAS.heart}>
        <Path d={heartPath(150, 70)} />
        <Path d={heartPath(46, 84)} opacity={0.8} />
      </G>
    );
  }
  if (mood === 'poke') return <Path d={heartPath(156, 76)} fill={TUNAS.heart} />;
  return null;
}

/** Outfits worn behind the face (on the head) and in front of it. */
export function outfit(o: OutfitId | null, layer: 'back' | 'front'): ReactNode {
  if (!o) return null;
  const back = o === 'crown' || o === 'songkok';
  if ((layer === 'back') !== back) return null;
  switch (o) {
    case 'crown': {
      const leaves = Array.from({ length: 9 }, (_, c) => {
        const t = c / 8;
        const cx = 62 + 76 * t;
        const cy = 90 - Math.sin(Math.PI * t) * 14;
        const rot = -45 + 90 * t;
        return (
          <Ellipse
            key={c}
            cx={cx}
            cy={cy}
            rx={8.5}
            ry={4.4}
            fill="#2C7A45"
            transform={`rotate(${rot.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})`}
          />
        );
      });
      const flowers = (
        [
          [70, 86, '#F2A0B5'],
          [86, 79, '#F5D27A'],
          [100, 76.5, '#F2A0B5'],
          [114, 79, '#F5D27A'],
          [130, 86, '#F2A0B5'],
        ] as const
      ).map(([x, y, col], i) => (
        <G key={`f${i}`}>
          <Circle cx={x} cy={y - 2} r={4.6} fill={col} />
          <Circle cx={x} cy={y - 2} r={1.7} fill="#fff" opacity={0.8} />
        </G>
      ));
      return (
        <G>
          {leaves}
          {flowers}
        </G>
      );
    }
    case 'songkok':
      return (
        <G>
          <Path d="M68 97 L72 72 Q100 65 128 72 L132 97 Q100 106 68 97 Z" fill="#1E1F27" />
          <Path d="M72 72 Q100 65 128 72 Q100 79 72 72 Z" fill="#2E2F3A" />
          <Path d="M70 90 Q100 98 130 90" stroke="#fff" strokeWidth={1.5} fill="none" opacity={0.12} />
        </G>
      );
    case 'shades':
      return (
        <G>
          <Rect x={62} y={110} width={34} height={21} rx={9} fill="#16201B" />
          <Rect x={104} y={110} width={34} height={21} rx={9} fill="#16201B" />
          <Path d="M96 117 Q100 113 104 117" stroke="#16201B" strokeWidth={4} fill="none" />
          <Path d="M68 115.5h9M110 115.5h9" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.45} />
        </G>
      );
    case 'scarf':
      return (
        <G>
          <Path d="M47 155 Q100 177 153 155 L155 168 Q100 192 45 168 Z" fill="#D9654F" />
          <Path d="M117 172 L131 171 L136 197 L121 198 Z" fill="#B9503D" />
          <Path d="M55 162 Q100 181 145 162" stroke="#fff" strokeWidth={2.5} fill="none" opacity={0.35} strokeDasharray="6 6" />
        </G>
      );
    case 'can':
      return (
        <G>
          <G transform="translate(150 140) rotate(-14)">
            <Rect x={0} y={10} width={26} height={22} rx={5} fill="#5B8FCB" />
            <Path d="M26 16 L42 5" stroke="#5B8FCB" strokeWidth={5} strokeLinecap="round" />
            <Path d="M4 10 Q13 -2 22 10" stroke="#4A79B0" strokeWidth={3.5} fill="none" />
            <Circle cx={43} cy={4} r={3.6} fill="#4A79B0" />
          </G>
          <G fill="#8EC3EE">
            <Circle cx={194} cy={128} r={2.2} />
            <Circle cx={197} cy={138} r={2} />
            <Circle cx={190} cy={141} r={1.8} />
          </G>
        </G>
      );
  }
}
