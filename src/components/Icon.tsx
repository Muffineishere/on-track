import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

/**
 * The app's own icon set, drawn on a 24 grid with a 2.2 stroke and round ends so the
 * marks carry the same weight and softness as Nunito and Tunas. Food and slip icons are
 * filled shapes; UI controls are strokes.
 */
const S = { stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;
const F = { fill: 'currentColor' } as const;

const ICONS = {
  check: <Path {...S} strokeWidth={2.8} d="M5 12.5l4.5 4.5L19 7.5" />,
  wave: <Path {...S} strokeWidth={2.8} d="M4.5 13.5Q8.25 8 12 12.5T19.5 11.5" />,
  x: <Path {...S} strokeWidth={2.8} d="M7 7l10 10M17 7L7 17" />,
  close: <Path {...S} d="M7 7l10 10M17 7L7 17" />,
  plus: <Path {...S} d="M12 5v14M5 12h14" />,
  minus: <Path {...S} d="M5 12h14" />,
  'chevron-left': <Path {...S} d="M14.5 6l-6 6 6 6" />,
  'chevron-right': <Path {...S} d="M9.5 6l6 6-6 6" />,
  flame: (
    <Path {...F} d="M12.2 2.5c.5 3.4 5.3 5.4 5.3 10.6a5.5 5.5 0 0 1-11 0c0-2.6 1.3-4.2 2.6-5.2.2 1.7 1 2.8 2.2 3.3-.6-3.6.1-6.3.9-8.7z" />
  ),
  shield: <Path {...F} d="M12 2.8l7.2 3v5.6c0 4.5-3.1 8.2-7.2 9.8-4.1-1.6-7.2-5.3-7.2-9.8V5.8z" />,
  sprout: (
    <>
      <Path {...S} d="M12 21v-8" />
      <Path {...F} d="M12 13c-.3-4-3-6.4-7.5-6.5.1 4.3 2.9 6.6 7.5 6.5zM12 12c.2-4.2 3-7 7.5-7.2.1 4.6-2.8 7.2-7.5 7.2z" />
    </>
  ),
  flower: (
    <>
      <Path {...S} d="M12 13v8M12 18c-2.5 0-4-1.3-4.5-3.5 2.4 0 4 1.2 4.5 3.5z" />
      <Circle {...F} cx={12} cy={5.6} r={2.6} />
      <Circle {...F} cx={8.6} cy={8.4} r={2.6} />
      <Circle {...F} cx={15.4} cy={8.4} r={2.6} />
      <Circle {...F} cx={10} cy={11.6} r={2.4} />
      <Circle {...F} cx={14} cy={11.6} r={2.4} />
    </>
  ),
  scale: (
    <>
      <Rect {...S} x={3.5} y={4.5} width={17} height={15} rx={4} />
      <Path {...S} d="M8.5 10.5a5 5 0 0 1 7 0M12 12l1.6-2.2" />
    </>
  ),
  list: <Path {...S} d="M9.5 7h10M9.5 12h10M9.5 17h10M4.8 7h.4M4.8 12h.4M4.8 17h.4" />,
  bell: <Path {...S} d="M6.5 16.5v-5a5.5 5.5 0 0 1 11 0v5l1.5 1.8h-14zM10 20.5a2.2 2.2 0 0 0 4 0" />,
  note: <Path {...S} d="M6.5 3.8h8l3.7 3.7v12.7h-11.7zM9.5 12h5.5M9.5 15.8h5.5" />,
  calendar: (
    <>
      <Rect {...S} x={3.8} y={5.3} width={16.4} height={15} rx={3.5} />
      <Path {...S} d="M3.8 10h16.4M8.5 3.3v3.8M15.5 3.3v3.8" />
    </>
  ),
  grid: (
    <>
      <Rect {...S} x={4} y={4} width={6.5} height={6.5} rx={2} />
      <Rect {...S} x={13.5} y={4} width={6.5} height={6.5} rx={2} />
      <Rect {...S} x={4} y={13.5} width={6.5} height={6.5} rx={2} />
      <Rect {...S} x={13.5} y={13.5} width={6.5} height={6.5} rx={2} />
    </>
  ),
  island: <Path {...S} d="M12 6.5l8.5 4.3-8.5 4.3-8.5-4.3zM3.5 10.8v2.7l8.5 4.3 8.5-4.3v-2.7" />,
  lock: (
    <>
      <Rect {...F} x={5} y={10.5} width={14} height={10} rx={3} />
      <Path {...S} d="M8.3 10.5V8a3.7 3.7 0 0 1 7.4 0v2.5" />
    </>
  ),
  hanger: <Path {...S} d="M10 6.2a2.2 2.2 0 1 1 2.2 2.2V10L3.8 16.3a.9.9 0 0 0 .6 1.6h15.2a.9.9 0 0 0 .6-1.6L12.2 10" />,
  heart: <Path {...F} d="M12 20.3s-7.6-4.6-7.6-10.5a4.2 4.2 0 0 1 7.6-2.5 4.2 4.2 0 0 1 7.6 2.5c0 5.9-7.6 10.5-7.6 10.5z" />,
  trash: <Path {...S} d="M4.5 7h15M9.5 7V4.8h5V7M6.8 7l.9 13h8.6l.9-13" />,
  pencil: <Path {...F} d="M5 19.3l1-4.3L15.4 5.6a2.1 2.1 0 0 1 3 3L9 18z" />,
  share: <Path {...S} d="M12 3.8v11M8 7.8l4-4 4 4M6 11.5v8.2h12v-8.2" />,
  copy: (
    <>
      <Rect {...S} x={8.5} y={8.5} width={11.5} height={11.5} rx={3} />
      <Path {...S} d="M15.5 5.5A2 2 0 0 0 13.5 4H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 1.5 2" />
    </>
  ),
  file: <Path {...S} d="M6.5 3.8h8l3.7 3.7v12.7h-11.7zM12 10.5v6M9.3 13.8l2.7 2.7 2.7-2.7" />,
  clock: (
    <>
      <Circle {...S} cx={12} cy={12} r={8.5} />
      <Path {...S} d="M12 7.5V12l3 2" />
    </>
  ),
  sun: (
    <>
      <Circle {...F} cx={12} cy={12} r={4} />
      <Path {...S} d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4" />
    </>
  ),
  sunrise: (
    <>
      <Path {...F} d="M7 17.5a5 5 0 0 1 10 0z" />
      <Path {...S} d="M3.5 17.5h17M12 6v2.5M5.6 10.6l1.6 1.4M18.4 10.6L16.8 12" />
    </>
  ),
  'trend-down': <Path {...S} strokeWidth={2.5} d="M4 7.5l5.5 5.5 3-3 7 7M14.8 17h4.7v-4.7" />,
  egg: <Path {...F} d="M12 3c3.6 0 6.2 5.3 6.2 9.8a6.2 6.2 0 0 1-12.4 0C5.8 8.3 8.4 3 12 3z" />,
  moon: <Path {...F} d="M19.5 14.6A7.8 7.8 0 1 1 9.4 4.5a6.2 6.2 0 0 0 10.1 10.1z" />,
  cup: (
    <>
      <Path {...F} opacity={0.3} d="M6.5 6h11l-1.5 13.3a2 2 0 0 1-2 1.7h-4a2 2 0 0 1-2-1.7z" />
      <Path {...S} d="M6.5 6h11l-1.5 13.3a2 2 0 0 1-2 1.7h-4a2 2 0 0 1-2-1.7zM7.2 10.5h9.6M13 6l2-3.2" />
    </>
  ),
  bowl: (
    <>
      <Path {...F} d="M3.5 11h17a8.5 8.5 0 0 1-17 0z" />
      <Path {...S} d="M8 8.3c1-1.6 2.4-2.4 4-2.4s3 .8 4 2.4" />
    </>
  ),
  plate: (
    <>
      <Circle {...S} cx={12} cy={12} r={8.5} />
      <Circle {...F} opacity={0.35} cx={12} cy={12} r={4.5} />
    </>
  ),
  people: (
    <>
      <Circle {...F} cx={8.5} cy={8.5} r={3.2} />
      <Circle {...F} opacity={0.6} cx={15.8} cy={9} r={2.9} />
      <Path
        {...F}
        d="M2.8 19c.6-3.3 2.9-5.2 5.7-5.2s5.1 1.9 5.7 5.2zM14.6 19c-.3-1.9-1.1-3.4-2.3-4.4.9-.6 2-.9 3.4-.9 2.5 0 4.3 1.8 4.8 5.3z"
      />
    </>
  ),
  cloud: <Path {...F} d="M7 18h10a4.2 4.2 0 0 0 .6-8.4 6 6 0 0 0-11.4 1.3A3.6 3.6 0 0 0 7 18z" />,
  dots: (
    <>
      <Circle {...F} cx={6} cy={12} r={2.1} />
      <Circle {...F} cx={12} cy={12} r={2.1} />
      <Circle {...F} cx={18} cy={12} r={2.1} />
    </>
  ),
  restart: <Path {...S} d="M5 12a7 7 0 1 0 2.1-5M5 4.5V8h3.5" />,
  eye: (
    <>
      <Path {...S} d="M2.8 12S6.2 5.8 12 5.8 21.2 12 21.2 12 17.8 18.2 12 18.2 2.8 12 2.8 12z" />
      <Circle {...F} cx={12} cy={12} r={2.8} />
    </>
  ),
  palette: (
    <>
      <Path
        {...S}
        d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.3-1.2-1.5-1.2-2.7 0-1 .8-1.6 1.9-1.6h2.2a3.8 3.8 0 0 0 3.8-3.8c0-4-3.8-7.2-8.5-7.2z"
      />
      <Circle {...F} cx={8} cy={11} r={1.3} />
      <Circle {...F} cx={11.5} cy={7.6} r={1.3} />
      <Circle {...F} cx={15.6} cy={9} r={1.3} />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 22, color }: { name: IconName; size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" color={color} pointerEvents="none">
      {ICONS[name]}
    </Svg>
  );
}
