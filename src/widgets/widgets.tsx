'use no memo';
// Widgets are rendered to an image by react-native-android-widget, which needs plain
// functions built from its primitives: no hooks, no React Compiler memoisation.
import { FlexWidget, OverlapWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

import { STATUS_LABEL } from '@/domain/content';
import type { Status } from '@/domain/types';
import type { WidgetModel } from '@/domain/widget';
import { dark as darkPalette, light as lightPalette, SKIES } from '@/theme/palette';

import { flameSvg, sceneSvg, shieldSvg, tunasSvg } from './art';

export const WIDGETS = {
  CheckIn: { label: 'Tunas check-in', description: 'Log your day with one tap on Tunas’s face.' },
  Tunas: { label: 'Tunas', description: 'Tunas and your streak at a glance.' },
  Week: { label: 'This week', description: 'Your week of check-ins.' },
} as const;
export type WidgetName = keyof typeof WIDGETS;

type Hex = `#${string}`;
type Rgba = `rgba(${number}, ${number}, ${number}, ${number})`;

const HEAVY = 'Nunito_800ExtraBold';
const BOLD = 'Nunito_700Bold';
const FACE_MOOD: Record<Status, Status> = { followed: 'followed', mostly: 'mostly', missed: 'missed' };

function ink(m: WidgetModel) {
  const night = SKIES[m.tod].night;
  return {
    night,
    text: (night ? '#EDF1EE' : '#1D2621') as Hex,
    soft: (night ? '#C9D2CC' : '#3D4A42') as Hex,
    chip: (night ? 'rgba(22, 29, 26, 0.78)' : 'rgba(255, 255, 255, 0.88)') as Rgba,
    pal: night ? darkPalette : lightPalette,
  };
}

function StreakChip({ m, size = 13 }: { m: WidgetModel; size?: number }) {
  const k = ink(m);
  return (
    <FlexWidget
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: k.chip,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
      }}
    >
      <SvgWidget svg={flameSvg(m.streak ? k.pal.flame : k.pal.ink3)} style={{ width: size + 2, height: size + 2 }} />
      <TextWidget text={` ${m.streak}`} style={{ fontFamily: HEAVY, fontSize: size, color: k.text }} />
    </FlexWidget>
  );
}

function AnswerButton({ m, s, faceSize }: { m: WidgetModel; s: Status; faceSize: number }) {
  const k = ink(m);
  const on = m.status === s;
  const soft = { followed: k.pal.followedSoft, mostly: k.pal.mostlySoft, missed: k.pal.missedSoft }[s] as Hex;
  const ring = { followed: k.pal.followed, mostly: k.pal.mostly, missed: k.pal.missed }[s] as Hex;
  return (
    <FlexWidget
      clickAction="ANSWER"
      clickActionData={{ status: s }}
      accessibilityLabel={`Log ${STATUS_LABEL[s]}`}
      style={{
        flex: 1,
        height: 'match_parent',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: on ? soft : k.chip,
        borderRadius: 18,
        borderWidth: on ? 2 : 0,
        borderColor: ring,
      }}
    >
      <SvgWidget svg={tunasSvg(1, FACE_MOOD[s])} style={{ width: faceSize, height: faceSize }} />
      <TextWidget text={STATUS_LABEL[s]} style={{ fontFamily: on ? HEAVY : BOLD, fontSize: 11, color: k.text }} />
    </FlexWidget>
  );
}

/** 4 by 2: Tunas in its sky, the question, and three faces to tap. */
export function CheckInWidget({ m, width, height }: { m: WidgetModel; width: number; height: number }) {
  const k = ink(m);
  const tunas = Math.max(56, Math.min(height - 44, width * 0.3, 110));
  const faceSize = Math.max(24, Math.min(34, (height - 96) * 0.9 + 14));
  return (
    <FlexWidget
      clickAction={m.onboarded ? undefined : 'OPEN_APP'}
      style={{ width: 'match_parent', height: 'match_parent', borderRadius: 26, overflow: 'hidden' }}
      accessibilityLabel={`On Track. ${m.title}. ${m.subtitle}. ${m.streak} day streak.`}
    >
      <OverlapWidget style={{ width: 'match_parent', height: 'match_parent' }}>
        <SvgWidget svg={sceneSvg(m.tod, width, height, false)} style={{ width, height }} />
        <FlexWidget style={{ width: 'match_parent', height: 'match_parent', flexDirection: 'row', padding: 12 }}>
          <FlexWidget
            clickAction="OPEN_APP"
            style={{ width: tunas, height: 'match_parent', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}
          >
            <SvgWidget svg={tunasSvg(m.stage, m.mood, m.outfit, m.status === 'followed')} style={{ width: tunas, height: tunas }} />
            <StreakChip m={m} />
          </FlexWidget>
          <FlexWidget style={{ flex: 1, height: 'match_parent', flexDirection: 'column', paddingLeft: 10 }}>
            <TextWidget text={m.title} maxLines={1} style={{ fontFamily: HEAVY, fontSize: 18, color: k.text }} />
            <TextWidget text={m.subtitle} maxLines={1} style={{ fontFamily: BOLD, fontSize: 12, color: k.soft, marginBottom: 8 }} />
            {m.onboarded ? (
              <FlexWidget style={{ flex: 1, width: 'match_parent', flexDirection: 'row', flexGap: 6 }}>
                <AnswerButton m={m} s="followed" faceSize={faceSize} />
                <AnswerButton m={m} s="mostly" faceSize={faceSize} />
                <AnswerButton m={m} s="missed" faceSize={faceSize} />
              </FlexWidget>
            ) : (
              <FlexWidget clickAction="OPEN_APP" style={{ backgroundColor: k.chip, borderRadius: 16, padding: 10 }}>
                <TextWidget text="Open On Track" style={{ fontFamily: HEAVY, fontSize: 14, color: k.text }} />
              </FlexWidget>
            )}
          </FlexWidget>
        </FlexWidget>
      </OverlapWidget>
    </FlexWidget>
  );
}

/** 2 by 2: Tunas, today's state and the streak. Tap to open the app. */
export function TunasWidget({ m, width, height }: { m: WidgetModel; width: number; height: number }) {
  const k = ink(m);
  const size = Math.max(56, Math.min(width, height) * 0.62);
  const label = m.status ? STATUS_LABEL[m.status] : m.onboarded ? 'Log today' : 'Say hi';
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={`Tunas. ${m.title}. ${m.streak} day streak.`}
      style={{ width: 'match_parent', height: 'match_parent', borderRadius: 26, overflow: 'hidden' }}
    >
      <OverlapWidget style={{ width: 'match_parent', height: 'match_parent' }}>
        <SvgWidget svg={sceneSvg(m.tod, width, height)} style={{ width, height }} />
        <FlexWidget
          style={{
            width: 'match_parent',
            height: 'match_parent',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 10,
          }}
        >
          <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <StreakChip m={m} size={12} />
            {m.forgiven ? (
              <SvgWidget svg={shieldSvg(k.pal.forgiven)} style={{ width: 18, height: 18 }} />
            ) : (
              <FlexWidget style={{ width: 1, height: 1 }} />
            )}
          </FlexWidget>
          <SvgWidget svg={tunasSvg(m.stage, m.mood, m.outfit, m.status === 'followed')} style={{ width: size, height: size }} />
          <FlexWidget style={{ backgroundColor: k.chip, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
            <TextWidget text={label} style={{ fontFamily: HEAVY, fontSize: 12, color: k.text }} />
          </FlexWidget>
        </FlexWidget>
      </OverlapWidget>
    </FlexWidget>
  );
}

function discSvg(fill: string, icon: string, iconColor: string, ring?: string) {
  const paths: Record<string, string> = {
    check: '<path d="M7 12.5l3.5 3.5L17 9" stroke="ICON" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    wave: '<path d="M6.5 13.5Q9.25 9 12 12.5T17.5 11.5" stroke="ICON" stroke-width="3" fill="none" stroke-linecap="round"/>',
    x: '<path d="M8 8l8 8M16 8l-8 8" stroke="ICON" stroke-width="3" fill="none" stroke-linecap="round"/>',
    shield: '<path d="M12 6l5 2v3.8c0 3-2.1 5.6-5 6.7-2.9-1.1-5-3.7-5-6.7V8z" fill="ICON"/>',
    none: '',
  };
  const stroke = ring ? ` stroke="${ring}" stroke-width="1.6"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="${ring ? 11 : 12}" fill="${fill}"${stroke}/>${(paths[icon] ?? '').replace(/ICON/g, iconColor)}</svg>`;
}

/** 4 by 1: the week as seven little discs. */
export function WeekWidget({ m, theme }: { m: WidgetModel; theme: 'light' | 'dark' }) {
  const p = theme === 'dark' ? darkPalette : lightPalette;
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={`This week, ${m.weekGood} of 7 good days. ${m.streak} day streak.`}
      style={{
        width: 'match_parent',
        height: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundGradient: {
          from: (theme === 'dark' ? '#1C2521' : '#FFFFFF') as Hex,
          to: (theme === 'dark' ? '#141A17' : '#F4EFE6') as Hex,
          orientation: 'TOP_BOTTOM',
        },
        borderRadius: 24,
        paddingHorizontal: 12,
      }}
    >
      <SvgWidget svg={tunasSvg(m.stage, m.mood, m.outfit)} style={{ width: 40, height: 40 }} />
      <FlexWidget style={{ flexDirection: 'column', paddingLeft: 6, paddingRight: 8 }}>
        <TextWidget text="This week" style={{ fontFamily: BOLD, fontSize: 11, color: p.ink2 as Hex }} />
        <TextWidget text={`${m.weekGood} of 7`} style={{ fontFamily: HEAVY, fontSize: 15, color: p.ink as Hex }} />
      </FlexWidget>
      <FlexWidget style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {m.week.map((d, i) => {
          const fill = d.status ? (d.forgiven ? p.forgiven : p[d.status]) : d.future ? 'none' : p.surface2;
          const iconColor = d.forgiven
            ? p.onForgiven
            : d.status === 'followed'
              ? p.onFollowed
              : d.status === 'mostly'
                ? p.onMostly
                : p.onMissed;
          const icon = !d.status
            ? 'none'
            : d.forgiven
              ? 'shield'
              : d.status === 'followed'
                ? 'check'
                : d.status === 'mostly'
                  ? 'wave'
                  : 'x';
          return (
            <FlexWidget key={i} style={{ flexDirection: 'column', alignItems: 'center' }}>
              <TextWidget text={d.letter} style={{ fontFamily: BOLD, fontSize: 10, color: (d.today ? p.brandText : p.ink3) as Hex }} />
              <FlexWidget
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: d.today && !d.status ? 2 : 0,
                  borderColor: p.brandText as Hex,
                  borderStyle: 'dashed',
                }}
              >
                <SvgWidget svg={discSvg(fill, icon, iconColor, d.future ? p.surface3 : undefined)} style={{ width: 24, height: 24 }} />
              </FlexWidget>
            </FlexWidget>
          );
        })}
      </FlexWidget>
    </FlexWidget>
  );
}
