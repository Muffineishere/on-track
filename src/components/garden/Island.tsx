import { useMemo, type ReactNode } from 'react';
import { View } from 'react-native';
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';
import Svg, { Circle, Ellipse, G, Path, Polygon, Rect } from 'react-native-svg';

import { STATUS_LABEL } from '@/domain/content';
import { formatLong } from '@/domain/dates';
import type { GardenCell, MonthGarden } from '@/domain/garden';
import { hash } from '@/domain/lines';
import type { DayKey } from '@/domain/types';

/**
 * The month as a small floating island of lawn, one tile per day, seen from above at an
 * angle. Good days grow a plant on their tile, a perfect week blossoms, a day covered by a
 * free miss gets a resting stone, and a missed day is bare soil. Nothing ever wilts.
 */
const PETALS = ['#F2B35E', '#EE9A8C', '#F5D27A', '#E9A3C0'];

interface Colors {
  grassA: string;
  grassB: string;
  pad: string;
  today: string;
  left: string;
  right: string;
  lip: string;
  soil: string;
  leaf: string;
  leafDark: string;
  trunk: string;
  stone: string;
  stoneHi: string;
  shadow: string;
}

const LIGHT: Colors = {
  grassA: '#B3D598',
  grassB: '#A7CD8B',
  pad: '#CCE2B9',
  today: '#DDF0CB',
  left: '#B48A5F',
  right: '#987149',
  lip: '#8DBB74',
  soil: '#C49D72',
  leaf: '#5AA468',
  leafDark: '#468C56',
  trunk: '#8A6240',
  stone: '#B9B3A5',
  stoneHi: '#D7D2C6',
  shadow: 'rgba(40,50,30,0.16)',
};

const DARK: Colors = {
  grassA: '#557E57',
  grassB: '#4D7650',
  pad: '#3F5C44',
  today: '#6C9969',
  left: '#5E4631',
  right: '#4E3A28',
  lip: '#47704B',
  soil: '#7A5E42',
  leaf: '#6DB77B',
  leafDark: '#57A066',
  trunk: '#9A7350',
  stone: '#9C978B',
  stoneHi: '#BDB8AC',
  shadow: 'rgba(0,0,0,0.35)',
};

export interface IslandGeometry {
  tw: number;
  th: number;
  ox: number;
  oy: number;
  depth: number;
  height: number;
}

export function islandGeometry(width: number, rows: number): IslandGeometry {
  const tw = Math.min(66, (width - 12) / ((7 + rows) / 2));
  const th = tw / 2;
  const head = tw * 0.95;
  const depth = tw * 0.3;
  return { tw, th, ox: 6 + (rows * tw) / 2, oy: head, depth, height: head + ((7 + rows) * th) / 2 + depth + 16 };
}

/** Top corner of a tile. */
const corner = (g: IslandGeometry, c: number, r: number) => ({ x: g.ox + ((c - r) * g.tw) / 2, y: g.oy + ((c + r) * g.th) / 2 });

function plant(cell: GardenCell, cx: number, cy: number, s: number, k: Colors): ReactNode {
  const h = hash(cell.key);
  const petal = PETALS[h % PETALS.length];
  const shadow = <Ellipse cx={cx} cy={cy + 1} rx={9 * s} ry={3.6 * s} fill={k.shadow} />;
  if (cell.status === 'followed' || cell.status === 'mostly') {
    if (cell.status === 'mostly') {
      return (
        <G key={cell.key}>
          {shadow}
          <Path d={`M${cx} ${cy} L${cx} ${cy - 9 * s}`} stroke={k.leafDark} strokeWidth={2 * s} strokeLinecap="round" />
          <Ellipse
            cx={cx - 4 * s}
            cy={cy - 9 * s}
            rx={4.8 * s}
            ry={2.4 * s}
            fill={k.leaf}
            transform={`rotate(-32 ${cx - 4 * s} ${cy - 9 * s})`}
          />
          <Ellipse
            cx={cx + 4 * s}
            cy={cy - 10.5 * s}
            rx={4.8 * s}
            ry={2.4 * s}
            fill={k.leaf}
            transform={`rotate(32 ${cx + 4 * s} ${cy - 10.5 * s})`}
          />
        </G>
      );
    }
    const kind = cell.perfectWeek ? 0 : h % 3;
    if (kind === 0) {
      return (
        <G key={cell.key}>
          {shadow}
          <Rect x={cx - 1.7 * s} y={cy - 12 * s} width={3.4 * s} height={12 * s} rx={1.2 * s} fill={k.trunk} />
          <Circle cx={cx} cy={cy - 18 * s} r={10 * s} fill={k.leafDark} />
          <Circle cx={cx - 3 * s} cy={cy - 21 * s} r={5.5 * s} fill={k.leaf} />
          {cell.perfectWeek ? (
            <G fill={petal}>
              <Circle cx={cx + 4 * s} cy={cy - 22 * s} r={2.4 * s} />
              <Circle cx={cx - 5 * s} cy={cy - 15 * s} r={2.2 * s} />
              <Circle cx={cx + 5 * s} cy={cy - 13 * s} r={2 * s} />
              <Circle cx={cx - 1 * s} cy={cy - 26 * s} r={2 * s} />
            </G>
          ) : null}
        </G>
      );
    }
    if (kind === 1) {
      return (
        <G key={cell.key}>
          {shadow}
          <Path d={`M${cx} ${cy} L${cx} ${cy - 15 * s}`} stroke={k.leafDark} strokeWidth={2 * s} strokeLinecap="round" />
          <Ellipse
            cx={cx - 4 * s}
            cy={cy - 6 * s}
            rx={5 * s}
            ry={2.2 * s}
            fill={k.leaf}
            transform={`rotate(-38 ${cx - 4 * s} ${cy - 6 * s})`}
          />
          <Ellipse
            cx={cx + 4 * s}
            cy={cy - 8 * s}
            rx={5 * s}
            ry={2.2 * s}
            fill={k.leaf}
            transform={`rotate(38 ${cx + 4 * s} ${cy - 8 * s})`}
          />
          <Path
            d={`M${cx - 5.5 * s} ${cy - 22 * s} Q${cx - 5.5 * s} ${cy - 14 * s} ${cx} ${cy - 14 * s} Q${cx + 5.5 * s} ${cy - 14 * s} ${cx + 5.5 * s} ${cy - 22 * s} L${cx + 2.7 * s} ${cy - 18.5 * s} L${cx} ${cy - 23 * s} L${cx - 2.7 * s} ${cy - 18.5 * s} Z`}
            fill={petal}
          />
        </G>
      );
    }
    return (
      <G key={cell.key}>
        {shadow}
        <Circle cx={cx - 5 * s} cy={cy - 5 * s} r={6 * s} fill={k.leafDark} />
        <Circle cx={cx + 5 * s} cy={cy - 5 * s} r={6 * s} fill={k.leafDark} />
        <Circle cx={cx} cy={cy - 9.5 * s} r={7 * s} fill={k.leaf} />
        <Circle cx={cx - 3 * s} cy={cy - 9 * s} r={1.7 * s} fill={petal} />
        <Circle cx={cx + 3.5 * s} cy={cy - 6 * s} r={1.7 * s} fill={petal} />
        <Circle cx={cx + 1 * s} cy={cy - 13 * s} r={1.7 * s} fill={petal} />
      </G>
    );
  }
  if (cell.status === 'missed' && cell.forgiven) {
    return (
      <G key={cell.key}>
        {shadow}
        <Ellipse cx={cx} cy={cy - 3 * s} rx={6.5 * s} ry={4.5 * s} fill={k.stone} />
        <Ellipse cx={cx - 1.5 * s} cy={cy - 4.5 * s} rx={3.5 * s} ry={2 * s} fill={k.stoneHi} />
        <Ellipse
          cx={cx + 2 * s}
          cy={cy - 8.5 * s}
          rx={3 * s}
          ry={1.5 * s}
          fill={k.leaf}
          transform={`rotate(-30 ${cx + 2 * s} ${cy - 8.5 * s})`}
        />
      </G>
    );
  }
  if (cell.status === 'missed') return <Ellipse key={cell.key} cx={cx} cy={cy} rx={9 * s} ry={4.4 * s} fill={k.soil} opacity={0.9} />;
  if (!cell.inMonth && h % 3 === 0) {
    return (
      <Path
        key={cell.key}
        d={`M${cx} ${cy}q${-1 * s} ${-5 * s} ${-4 * s} ${-7 * s}M${cx} ${cy}q0 ${-6 * s} ${1 * s} ${-9 * s}M${cx} ${cy}q${2 * s} ${-4 * s} ${5 * s} ${-6 * s}`}
        stroke={k.lip}
        strokeWidth={1.6 * s}
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  return null;
}

export function cellLabel(c: GardenCell) {
  return `${formatLong(c.date)}: ${c.status ? STATUS_LABEL[c.status] + (c.forgiven ? ', free miss used' : '') : 'no answer'}`;
}

export function Island({
  garden,
  width,
  dark,
  onPressDay,
}: {
  garden: MonthGarden;
  width: number;
  dark: boolean;
  onPressDay: (key: DayKey) => void;
}) {
  const k = dark ? DARK : LIGHT;
  const g = useMemo(() => islandGeometry(width, garden.rows), [width, garden.rows]);
  const R = garden.rows;

  const tap = useTapGesture({
    runOnJS: true,
    onActivate: (e) => {
      const u = (e.x - g.ox) / (g.tw / 2);
      const v = (e.y - g.oy) / (g.th / 2);
      const c = Math.floor((u + v) / 2);
      const r = Math.floor((v - u) / 2);
      if (c < 0 || c > 6 || r < 0 || r >= R) return;
      const cell = garden.cells[r * 7 + c];
      if (cell && cell.inMonth && !cell.future) onPressDay(cell.key);
    },
  });

  const { tiles, plants, sides } = useMemo(() => {
    const L = corner(g, 0, R);
    const B = corner(g, 7, R);
    const Rt = corner(g, 7, 0);
    const d = g.depth;
    const sideEls = (
      <G>
        <Ellipse cx={(L.x + Rt.x) / 2} cy={B.y + d + 7} rx={(Rt.x - L.x) / 2.6} ry={6} fill={k.shadow} opacity={0.55} />
        <Ellipse cx={(L.x + Rt.x) / 2} cy={B.y + d + 6} rx={(Rt.x - L.x) / 3.6} ry={4} fill={k.shadow} opacity={0.6} />
        <Polygon points={`${L.x},${L.y} ${B.x},${B.y} ${B.x},${B.y + d} ${L.x},${L.y + d}`} fill={k.left} />
        <Polygon points={`${B.x},${B.y} ${Rt.x},${Rt.y} ${Rt.x},${Rt.y + d} ${B.x},${B.y + d}`} fill={k.right} />
        <Polygon points={`${L.x},${L.y} ${B.x},${B.y} ${B.x},${B.y + 3.5} ${L.x},${L.y + 3.5}`} fill={k.lip} />
        <Polygon points={`${B.x},${B.y} ${Rt.x},${Rt.y} ${Rt.x},${Rt.y + 3.5} ${B.x},${B.y + 3.5}`} fill={k.lip} />
      </G>
    );
    const tileEls: ReactNode[] = [];
    const todayEls: ReactNode[] = [];
    const sorted = [...garden.cells].sort((a, b) => a.col + a.row - (b.col + b.row));
    for (const cell of garden.cells) {
      const p = corner(g, cell.col, cell.row);
      const pts = `${p.x},${p.y} ${p.x + g.tw / 2},${p.y + g.th / 2} ${p.x},${p.y + g.th} ${p.x - g.tw / 2},${p.y + g.th / 2}`;
      const fill = cell.today ? k.today : !cell.inMonth ? k.pad : (cell.col + cell.row) % 2 ? k.grassB : k.grassA;
      tileEls.push(<Polygon key={cell.key} points={pts} fill={fill} />);
      if (cell.today) {
        const inset = 3;
        todayEls.push(
          <Polygon
            key="today"
            points={`${p.x},${p.y + inset} ${p.x + g.tw / 2 - inset * 2},${p.y + g.th / 2} ${p.x},${p.y + g.th - inset} ${p.x - g.tw / 2 + inset * 2},${p.y + g.th / 2}`}
            fill="none"
            stroke="#fff"
            strokeWidth={2}
            strokeDasharray="4 4"
            strokeLinejoin="round"
          />,
        );
      }
    }
    const s = g.tw / 56;
    const plantEls = sorted.map((cell) => {
      const p = corner(g, cell.col, cell.row);
      return plant(cell, p.x, p.y + g.th / 2 + 2 * s, s, k);
    });
    return { tiles: [...tileEls, ...todayEls], plants: plantEls, sides: sideEls };
  }, [garden, g, k, R]);

  const label = `Garden for this month: ${garden.counts.followed} followed, ${garden.counts.mostly} mostly, ${garden.counts.missed} missed. Switch to the calendar to pick a day.`;

  return (
    <GestureDetector gesture={tap}>
      <View accessible accessibilityRole="image" accessibilityLabel={label} style={{ width, height: g.height }}>
        <Svg width={width} height={g.height}>
          {sides}
          {tiles}
          {plants}
        </Svg>
      </View>
    </GestureDetector>
  );
}
