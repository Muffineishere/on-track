import { addDays, keyOf } from '../dates';
import { fresh } from '../state';
import { activeKey, missingDay, streak, weekInfo, weighDue } from '../streak';
import type { Data, Status } from '../types';

// Tuesday 24 November 2026, 8pm.
const NOW = new Date(2026, 10, 24, 20, 0);
const day = (offset: number) => keyOf(addDays(new Date(2026, 10, 24), offset));

function withLog(entries: [number, Status][], extra: Partial<Data> = {}): Data {
  const d = fresh();
  d.onboarded = true;
  for (const [off, s] of entries) d.log[day(off)] = s;
  d.startedAt = Object.keys(d.log).sort()[0] ?? day(0);
  return { ...d, ...extra };
}

describe('activeKey', () => {
  it('is today during the day', () => {
    expect(activeKey(withLog([[-1, 'followed']]), NOW)).toBe(day(0));
  });

  it('is yesterday before 4am when yesterday is unanswered', () => {
    const lateNight = new Date(2026, 10, 25, 1, 30);
    const d = withLog([[-1, 'followed']]);
    expect(activeKey(d, lateNight)).toBe(day(0));
  });

  it('is today before 4am once yesterday has an answer', () => {
    const lateNight = new Date(2026, 10, 25, 1, 30);
    const d = withLog([[0, 'followed']]);
    expect(activeKey(d, lateNight)).toBe(day(1));
  });

  it('ignores days before tracking started', () => {
    const lateNight = new Date(2026, 10, 25, 1, 30);
    const d = fresh();
    d.onboarded = true;
    d.startedAt = day(1);
    expect(activeKey(d, lateNight)).toBe(day(1));
  });
});

describe('streak', () => {
  it('is zero with no check-ins and starts with one free miss', () => {
    expect(streak(fresh(), NOW)).toEqual({ cur: 0, best: 0, tokens: 1, forgiven: {} });
  });

  it('counts consecutive good days, Mostly included', () => {
    const r = streak(
      withLog([
        [-2, 'followed'],
        [-1, 'mostly'],
        [0, 'followed'],
      ]),
      NOW,
    );
    expect(r.cur).toBe(3);
    expect(r.best).toBe(3);
  });

  it('does not break while today is still unanswered', () => {
    const r = streak(
      withLog([
        [-2, 'followed'],
        [-1, 'followed'],
      ]),
      NOW,
    );
    expect(r.cur).toBe(2);
  });

  it('breaks on an unanswered past day', () => {
    const r = streak(
      withLog([
        [-3, 'followed'],
        [-1, 'followed'],
      ]),
      NOW,
    );
    expect(r.cur).toBe(1);
    expect(r.best).toBe(1);
  });

  it('spends a free miss on a missed day and keeps the run going', () => {
    // Sun 22, Mon 23 (adds a free miss), Tue 24.
    const r = streak(
      withLog([
        [-4, 'followed'],
        [-3, 'followed'],
        [-2, 'missed'],
        [-1, 'followed'],
        [0, 'followed'],
      ]),
      NOW,
    );
    expect(r.forgiven[day(-2)]).toBe(true);
    expect(r.cur).toBe(4);
    // Started with 1, spent 1 on Sunday, earned 1 on Monday.
    expect(r.tokens).toBe(1);
  });

  it('resets when no free miss is left', () => {
    // Wed 18 to Sat 21 are in one week: only the starting free miss is available.
    const r = streak(
      withLog([
        [-6, 'followed'],
        [-5, 'missed'],
        [-4, 'missed'],
        [-3, 'followed'],
      ]),
      NOW,
    );
    expect(r.forgiven[day(-5)]).toBe(true);
    expect(r.forgiven[day(-4)]).toBeUndefined();
    expect(r.best).toBe(1);
  });

  it('adds one free miss each Monday, two at most', () => {
    const entries: [number, Status][] = [];
    for (let i = -30; i <= 0; i++) entries.push([i, 'followed']);
    const r = streak(withLog(entries), NOW);
    expect(r.tokens).toBe(2);
    expect(r.cur).toBe(31);
  });
});

describe('weekInfo', () => {
  it('tallies a week and spots a perfect one', () => {
    const mon = new Date(2026, 10, 16);
    const entries: [number, Status][] = [-8, -7, -6, -5, -4, -3, -2].map((o) => [o, 'followed']);
    const w = weekInfo(withLog(entries), mon);
    expect(w.good).toBe(7);
    expect(w.perfect).toBe(true);
  });

  it('counts slips only on days that were not Followed', () => {
    const d = withLog([
      [-8, 'mostly'],
      [-7, 'followed'],
    ]);
    d.slips[day(-8)] = 'late';
    d.slips[day(-7)] = 'sweet';
    const w = weekInfo(d, new Date(2026, 10, 16));
    expect(w.slips).toEqual({ late: 1 });
    expect(w.answered).toBe(2);
  });
});

describe('missingDay', () => {
  it('finds an unanswered yesterday', () => {
    const d = withLog([
      [-3, 'followed'],
      [-2, 'followed'],
    ]);
    expect(keyOf(missingDay(d, NOW)!)).toBe(day(-1));
  });

  it('is null when recent days are answered', () => {
    expect(
      missingDay(
        withLog([
          [-2, 'followed'],
          [-1, 'mostly'],
        ]),
        NOW,
      ),
    ).toBeNull();
  });
});

describe('weighDue', () => {
  it('suggests a first weigh-in once tracking has begun', () => {
    expect(weighDue(withLog([[-1, 'followed']]), NOW)).toEqual({ due: true, first: true });
  });

  it('waits a week after the last weigh-in', () => {
    const d = withLog([[-1, 'followed']], { weights: [{ d: day(-3), kg: 70 }] });
    expect(weighDue(d, NOW).due).toBe(false);
    const later = withLog([[-1, 'followed']], { weights: [{ d: day(-7), kg: 70 }] });
    expect(weighDue(later, NOW).due).toBe(true);
  });

  it('respects a snooze', () => {
    const d = withLog([[-1, 'followed']], { wSnooze: day(2) });
    expect(weighDue(d, NOW).due).toBe(false);
  });
});
