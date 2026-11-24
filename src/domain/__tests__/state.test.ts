import { checkBackup, backupText } from '../backup';
import { addDays, keyOf } from '../dates';
import { firstMonth, monthGarden, patterns, perfectWeeks } from '../garden';
import { growth, stageOf } from '../stage';
import { makeSample } from '../sample';
import { countGood, fresh, normalize } from '../state';
import { streak } from '../streak';
import { recapDue, recapTarget, weekWeightChange } from '../recap';
import { tunasLine } from '../lines';

const NOW = new Date(2026, 10, 24, 20, 0);

describe('normalize', () => {
  it('returns defaults for junk', () => {
    expect(normalize(null)).toEqual(fresh());
    expect(normalize('hello')).toEqual(fresh());
    expect(normalize([1, 2])).toEqual(fresh());
  });

  it('keeps valid entries and drops broken ones', () => {
    const d = normalize(
      {
        diet: 'protein',
        log: { '2026-11-01': 'followed', '2026-11-02': 'great', nope: 'missed' },
        slips: { '2026-11-01': 'late', '2026-11-02': 'aliens' },
        notes: { '2026-11-01': '  Teh tarik with friends  ', '2026-11-03': '   ' },
        weights: [
          { d: '2026-11-02', kg: 70.04 },
          { d: '2026-11-01', kg: '71.2' },
          { d: '2026-11-02', kg: 69.9 },
          { d: 'bad', kg: 70 },
          { d: '2026-11-05', kg: 900 },
        ],
        goal: 12,
        outfit: 'cape',
        reminder: '25:00',
        theme: 'dark',
      },
      NOW,
    );
    expect(d.diet).toBe('protein');
    expect(d.log).toEqual({ '2026-11-01': 'followed' });
    expect(d.slips).toEqual({ '2026-11-01': 'late' });
    expect(d.notes).toEqual({ '2026-11-01': 'Teh tarik with friends' });
    expect(d.weights).toEqual([
      { d: '2026-11-01', kg: 71.2 },
      { d: '2026-11-02', kg: 69.9 },
    ]);
    expect(d.goal).toBeNull();
    expect(d.outfit).toBeNull();
    expect(d.reminder).toBe('21:00');
    expect(d.theme).toBe('dark');
    expect(d.onboarded).toBe(true);
    expect(d.startedAt).toBe('2026-11-01');
  });

  it('reads a version 2 backup from the web prototype', () => {
    const v2 = {
      v: 2,
      diet: 'early',
      log: { '2026-11-20': 'mostly' },
      seenRecap: '',
      reminder: '21:30',
      onboarded: true,
      startedAt: '2026-11-19',
    };
    const d = normalize(v2, NOW);
    expect(d.v).toBe(3);
    expect(d.reminder).toBe('21:30');
    expect(d.reminderOn).toBe(true);
    expect(d.startedAt).toBe('2026-11-19');
  });

  it('derives seen outfits when they are missing', () => {
    const log: Record<string, string> = {};
    for (let i = 1; i <= 8; i++) log[keyOf(addDays(NOW, -i))] = 'followed';
    expect(normalize({ log }, NOW).seenOutfits).toEqual(['crown']);
  });
});

describe('stages', () => {
  it('maps good days to stages', () => {
    expect([0, 1, 6, 7, 29, 30, 99, 100, 400].map(stageOf)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4]);
  });

  it('reports growth toward the next stage', () => {
    expect(growth(10)).toEqual({ stage: 2, toNext: 20, progress: 3 / 23, nextAt: 30 });
    expect(growth(150)).toEqual({ stage: 4, toNext: 0, progress: 1, nextAt: null });
  });
});

describe('sample data', () => {
  const s = makeSample(NOW);

  it('is deterministic', () => {
    expect(makeSample(NOW)).toEqual(s);
  });

  it('covers 48 days, a weekly weigh-in and a goal', () => {
    expect(Object.keys(s.log)).toHaveLength(48);
    expect(s.weights).toHaveLength(8);
    expect(s.goal).toBe(68);
    expect(s.onboarded).toBe(true);
  });

  it('contains at least one perfect week', () => {
    expect(perfectWeeks(s, NOW)).toBeGreaterThanOrEqual(1);
    expect(countGood(s.log)).toBeGreaterThan(30);
  });

  it('survives a backup round trip', () => {
    const check = checkBackup(backupText(s, NOW), NOW);
    expect(check?.ok).toBe(true);
    if (check?.ok) {
      expect(check.data.log).toEqual(s.log);
      expect(check.data.weights).toEqual(s.weights);
      expect(check.summary).toBe('Found 48 check-ins and 8 weigh-ins. Restoring replaces what’s here now.');
    }
  });
});

describe('checkBackup', () => {
  it('ignores empty text and rejects junk', () => {
    expect(checkBackup('   ', NOW)).toBeNull();
    expect(checkBackup('{oops', NOW)).toMatchObject({ ok: false });
    expect(checkBackup('{"hello": 1}', NOW)).toMatchObject({ ok: false });
  });
});

describe('monthGarden', () => {
  it('lays November 2026 out in six Monday-first weeks', () => {
    const s = makeSample(NOW);
    const g = monthGarden(s, 2026, 10, NOW, streak(s, NOW));
    // 1 November 2026 is a Sunday, so six padding days lead the month.
    expect(g.rows).toBe(6);
    expect(g.cells).toHaveLength(42);
    expect(g.cells[6]).toMatchObject({ key: '2026-11-01', inMonth: true, col: 6, row: 0 });
    expect(g.cells[5].inMonth).toBe(false);
    const today = g.cells.find((c) => c.today);
    expect(today?.key).toBe('2026-11-24');
    expect(g.cells.filter((c) => c.future && c.inMonth)).toHaveLength(6);
    const total = g.counts.followed + g.counts.mostly + g.counts.missed;
    expect(total).toBe(23);
  });

  it('starts browsing at the first check-in month', () => {
    expect(firstMonth(makeSample(NOW), NOW)).toEqual(new Date(2026, 9, 1));
    expect(firstMonth(fresh(), NOW)).toEqual(new Date(2026, 10, 1));
  });
});

describe('patterns', () => {
  it('needs two weeks of check-ins', () => {
    expect(patterns(fresh(), NOW).answered).toBe(0);
  });

  it('finds weekday patterns in the sample', () => {
    const p = patterns(makeSample(NOW), NOW);
    expect(p.answered).toBeGreaterThanOrEqual(14);
    expect(p.pct).toHaveLength(7);
    expect(p.bestDay).not.toBeNull();
  });
});

describe('recap', () => {
  it('targets last week until Sunday evening', () => {
    expect(keyOf(recapTarget(NOW))).toBe('2026-11-16');
    expect(keyOf(recapTarget(new Date(2026, 10, 29, 19, 0)))).toBe('2026-11-23');
  });

  it('is due once per week with answers', () => {
    const s = makeSample(NOW);
    expect(recapDue(s, NOW)).toBeNull();
    s.seenRecap = '';
    expect(keyOf(recapDue(s, NOW)!)).toBe('2026-11-16');
  });

  it('measures the week’s weight change', () => {
    const d = fresh();
    d.weights = [
      { d: '2026-11-12', kg: 72 },
      { d: '2026-11-18', kg: 71.4 },
    ];
    expect(weekWeightChange(d, new Date(2026, 10, 16))).toBeCloseTo(-0.6, 6);
    expect(weekWeightChange(d, new Date(2026, 10, 2))).toBeNull();
  });
});

describe('tunasLine', () => {
  it('reacts to today’s answer', () => {
    const d = fresh();
    d.onboarded = true;
    d.log['2026-11-24'] = 'followed';
    expect(['Mantap! Another good day.', 'Yay, I’m growing!', 'That’s the way. Proud of you.']).toContain(tunasLine(d, NOW));
  });

  it('counts down to the kitchen cutoff', () => {
    const d = fresh();
    d.onboarded = true;
    expect(tunasLine(d, new Date(2026, 10, 24, 17, 30))).toBe('Kitchen closes in 30 min. Last bites!');
  });
});
