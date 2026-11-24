import type { TimeOfDay } from '@/domain/dates';
import type { Mood, OutfitId } from '@/domain/types';
import { SKIES, TUNAS } from '@/theme/palette';

/**
 * Tunas and its world as SVG text. Home screen widgets draw from SVG strings, so this
 * mirrors the React drawing in components/tunas/parts.tsx on the same 200 by 200 grid.
 */
const INK = TUNAS.ink;
const f = (n: number) => +n.toFixed(1);

function eyes(mood: Mood) {
  const o = (x: number) =>
    `<ellipse cx="${x}" cy="121" rx="7" ry="8.5" fill="${INK}"/><circle cx="${x + 2.6}" cy="117.5" r="2.8" fill="#fff"/><circle cx="${x - 2.4}" cy="124.5" r="1.2" fill="#fff" opacity=".7"/>`;
  const lid = (x: number) =>
    `<path d="M${x - 8} 121 Q${x} 129 ${x + 8} 121 Z" fill="${INK}"/><path d="M${x - 9} 120.5 L${x + 9} 120.5" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  const happy = (x: number) =>
    `<path d="M${x - 8} 124 Q${x} 113 ${x + 8} 124" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  const sad = (x: number) =>
    `<path d="M${x - 8} 121 Q${x} 128 ${x + 8} 121" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" fill="none"/>`;
  if (mood === 'followed' || mood === 'poke' || mood === 'pet') return happy(80) + happy(120);
  if (mood === 'mostly') return o(80) + happy(120);
  if (mood === 'missed') return sad(80) + sad(120);
  if (mood === 'evening') return lid(80) + lid(120);
  return o(80) + o(120);
}

function mouth(mood: Mood) {
  if (mood === 'followed')
    return `<path d="M86 138 Q100 162 114 138 Q100 142 86 138 Z" fill="${INK}"/><path d="M93 149 Q100 156 107 149 Q100 146 93 149 Z" fill="#F08F7E"/>`;
  if (mood === 'mostly')
    return `<path d="M89 141 Q100 152 111 141" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" fill="none"/>`;
  if (mood === 'missed')
    return `<path d="M93 147 Q100 143 107 147" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" fill="none"/>`;
  if (mood === 'evening') return `<ellipse cx="100" cy="146" rx="5" ry="6.5" fill="${INK}"/>`;
  return `<path d="M91 141 Q100 149 109 141" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" fill="none"/>`;
}

function leaf(x: number, y: number, rot: number, len: number) {
  return (
    `<g transform="rotate(${rot} ${x} ${y})"><path d="M${x - len} ${y} Q${x} ${f(y - len * 0.75)} ${x + len} ${y} Q${x} ${f(y + len * 0.75)} ${x - len} ${y} Z" fill="url(#tl)"/>` +
    `<path d="M${x - len + 3} ${y} L${x + len - 4} ${y}" stroke="${TUNAS.stem}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/></g>`
  );
}

function sprout(stage: number, droop: boolean) {
  if (stage === 0) return `<path d="M100 82 Q104 74 99 69" stroke="${TUNAS.stem}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  const st = stage >= 2 ? 50 : 62;
  const L = stage >= 2 ? 19 : 16;
  let s = `<path d="M100 84 Q${droop ? 107 : 97} 70 100 ${st}" stroke="${TUNAS.stem}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  if (stage >= 4)
    s +=
      leaf(80, 76, droop ? -110 : -150, 13) +
      leaf(120, 76, droop ? 110 : 150, 13) +
      leaf(80, 60, droop ? -70 : -20, 13) +
      leaf(120, 60, droop ? 70 : 20, 13);
  s += `<g transform="translate(${-L + 2} 0)">${leaf(100, st + 2, droop ? -70 : -28, L)}</g>`;
  if (stage >= 2) s += `<g transform="translate(${L - 2} 0)">${leaf(100, st + 2, droop ? 70 : 28, L)}</g>`;
  if (stage >= 3) {
    const fy = st - 7;
    let p = '';
    for (let i = 0; i < 5; i++) {
      const a = ((i * 72 - 90) * Math.PI) / 180;
      p += `<circle cx="${f(100 + Math.cos(a) * 8.5)}" cy="${f(fy + Math.sin(a) * 8.5)}" r="7" fill="${TUNAS.petal}"/>`;
    }
    s += `<g${droop ? ` transform="rotate(28 100 ${st})"` : ''}>${p}<circle cx="100" cy="${fy}" r="5.5" fill="#EE8A5E"/></g>`;
  }
  return s;
}

function wear(o: OutfitId | null) {
  if (o === 'crown') {
    let s = '';
    for (let c = 0; c < 9; c++) {
      const t = c / 8;
      const cx = f(62 + 76 * t);
      const cy = f(90 - Math.sin(Math.PI * t) * 14);
      s += `<ellipse cx="${cx}" cy="${cy}" rx="8.5" ry="4.4" fill="#2C7A45" transform="rotate(${f(-45 + 90 * t)} ${cx} ${cy})"/>`;
    }
    for (const [x, y, col] of [
      [70, 86, '#F2A0B5'],
      [86, 79, '#F5D27A'],
      [100, 76.5, '#F2A0B5'],
      [114, 79, '#F5D27A'],
      [130, 86, '#F2A0B5'],
    ] as const)
      s += `<circle cx="${x}" cy="${y - 2}" r="4.6" fill="${col}"/>`;
    return { back: s, front: '' };
  }
  if (o === 'songkok')
    return {
      back: '<path d="M68 97 L72 72 Q100 65 128 72 L132 97 Q100 106 68 97 Z" fill="#1E1F27"/><path d="M72 72 Q100 65 128 72 Q100 79 72 72 Z" fill="#2E2F3A"/>',
      front: '',
    };
  if (o === 'shades')
    return {
      back: '',
      front:
        '<rect x="62" y="110" width="34" height="21" rx="9" fill="#16201B"/><rect x="104" y="110" width="34" height="21" rx="9" fill="#16201B"/><path d="M96 117 Q100 113 104 117" stroke="#16201B" stroke-width="4" fill="none"/>',
    };
  if (o === 'scarf')
    return {
      back: '',
      front:
        '<path d="M47 155 Q100 177 153 155 L155 168 Q100 192 45 168 Z" fill="#D9654F"/><path d="M117 172 L131 171 L136 197 L121 198 Z" fill="#B9503D"/>',
    };
  if (o === 'can')
    return {
      back: '',
      front:
        '<g transform="translate(150 140) rotate(-14)"><rect x="0" y="10" width="26" height="22" rx="5" fill="#5B8FCB"/><path d="M26 16 L42 5" stroke="#5B8FCB" stroke-width="5" stroke-linecap="round"/></g>',
    };
  return { back: '', front: '' };
}

/** Tunas as a standalone SVG string. */
export function tunasSvg(stage: number, mood: Mood, outfit: OutfitId | null = null, sparkle = false) {
  const droop = mood === 'missed';
  const w = wear(outfit);
  const fx = sparkle
    ? `<g fill="${TUNAS.petal}"><path d="M30 70 l3.2 8 8 3.2 -8 3.2 -3.2 8 -3.2 -8 -8 -3.2 8 -3.2z"/><path d="M168 96 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4z"/><circle cx="158" cy="60" r="3.5"/></g>`
    : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs>` +
    `<radialGradient id="tb" cx="38%" cy="30%" r="78%"><stop offset="0" stop-color="${TUNAS.hi}"/><stop offset=".55" stop-color="${TUNAS.body}"/><stop offset="1" stop-color="${TUNAS.lo}"/></radialGradient>` +
    `<linearGradient id="tl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${TUNAS.hi}"/><stop offset="1" stop-color="${TUNAS.body}"/></linearGradient></defs>` +
    `<ellipse cx="100" cy="188" rx="50" ry="7" fill="#0A1A10" opacity=".16"/>${fx}${sprout(stage, droop)}` +
    `<ellipse cx="80" cy="180" rx="15" ry="8" fill="${TUNAS.lo}"/><ellipse cx="120" cy="180" rx="15" ry="8" fill="${TUNAS.lo}"/>` +
    `<path d="M100 80 C140 80 160 108 160 136 C160 164 134 182 100 182 C66 182 40 164 40 136 C40 108 60 80 100 80 Z" fill="url(#tb)"/>` +
    `<ellipse cx="100" cy="152" rx="35" ry="25" fill="${TUNAS.belly}" opacity=".85"/>` +
    `<ellipse cx="72" cy="101" rx="13" ry="7" fill="#fff" opacity=".35" transform="rotate(-28 72 101)"/>${w.back}` +
    `<ellipse cx="44" cy="146" rx="8" ry="13" fill="${TUNAS.lo}" transform="rotate(${droop ? 12 : -24} 44 146)"/>` +
    `<ellipse cx="156" cy="146" rx="8" ry="13" fill="${TUNAS.lo}" transform="rotate(${droop ? -12 : 24} 156 146)"/>` +
    `<ellipse cx="68" cy="137" rx="9" ry="6" fill="${TUNAS.cheek}" opacity=".6"/><ellipse cx="132" cy="137" rx="9" ry="6" fill="${TUNAS.cheek}" opacity=".6"/>` +
    `${eyes(mood)}${mouth(mood)}${w.front}</svg>`
  );
}

/** The sky behind the widgets: gradient, sun or moon (unless orb is false) and stars, clouds and two hills. */
export function sceneSvg(tod: TimeOfDay, width: number, height: number, orb = true) {
  const sky = SKIES[tod];
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const hill = (y: number, c: string, amp: number) =>
    `<path d="M0 ${f(h * y)} C${f(w * 0.25)} ${f(h * (y - amp))} ${f(w * 0.55)} ${f(h * (y + amp * 0.6))} ${w} ${f(h * (y - amp * 0.4))} L${w} ${h} L0 ${h} Z" fill="${c}"/>`;
  const sx = w - Math.min(w, h) * 0.28;
  const sy = h * 0.3;
  const r = Math.min(w, h) * 0.11;
  let body: string;
  if (sky.night) {
    // Stars stay near the edges, clear of the widget's text.
    const stars = [
      [0.05, 0.1],
      [0.03, 0.42],
      [0.62, 0.06],
      [0.95, 0.62],
      [0.88, 0.08],
      [0.12, 0.62],
    ]
      .map(
        ([x, y], i) => `<circle cx="${f(w * x)}" cy="${f(h * y)}" r="${i % 2 ? 1.1 : 1.6}" fill="#fff" opacity="${i % 3 ? 0.85 : 0.5}"/>`,
      )
      .join('');
    body = !orb
      ? stars
      : `${stars}<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(r * 1.9)}" fill="#F3F0DC" opacity=".07"/><circle cx="${f(sx)}" cy="${f(sy)}" r="${f(r)}" fill="#F3F0DC"/><circle cx="${f(sx + r * 0.45)}" cy="${f(sy - r * 0.3)}" r="${f(r * 0.85)}" fill="${sky.top}"/>`;
  } else {
    const cloud = (x: number, y: number, s: number) =>
      `<g transform="translate(${f(x)} ${f(y)}) scale(${s})" fill="#fff" opacity=".75"><ellipse cx="0" cy="0" rx="34" ry="12"/><circle cx="-12" cy="-8" r="13"/><circle cx="8" cy="-13" r="16"/><circle cx="24" cy="-4" r="10"/></g>`;
    const sun = orb
      ? `<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(r * 1.8)}" fill="${sky.sun}" opacity=".2"/><circle cx="${f(sx)}" cy="${f(sy)}" r="${f(r)}" fill="${sky.sun}"/>`
      : '';
    body = `${sun}${cloud(w * 0.18, h * 0.26, Math.min(w, h) / 320)}`;
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky.top}"/><stop offset="1" stop-color="${sky.bottom}"/></linearGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#sk)"/>${body}${hill(0.74, sky.hills[1], 0.08)}${hill(0.86, sky.hills[2], 0.06)}</svg>`
  );
}

export const flameSvg = (color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${color}" d="M12.2 2.5c.5 3.4 5.3 5.4 5.3 10.6a5.5 5.5 0 0 1-11 0c0-2.6 1.3-4.2 2.6-5.2.2 1.7 1 2.8 2.2 3.3-.6-3.6.1-6.3.9-8.7z"/></svg>`;

export const shieldSvg = (color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${color}" d="M12 2.8l7.2 3v5.6c0 4.5-3.1 8.2-7.2 9.8-4.1-1.6-7.2-5.3-7.2-9.8V5.8z"/></svg>`;
