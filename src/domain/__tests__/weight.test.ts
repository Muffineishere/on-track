import { addDays, keyOf } from '../dates';
import { deltaTone, formatKg, formatSigned, goalProgress, parseKg, projectGoal, slope, trendSeries } from '../weight';

const base = new Date(2026, 8, 1);
const weekly = (kgs: number[]) => kgs.map((kg, i) => ({ d: keyOf(addDays(base, i * 7)), kg }));

describe('trendSeries', () => {
  it('starts at the first weigh-in and moves part of the way toward each new one', () => {
    const s = trendSeries(weekly([80, 79]));
    expect(s[0].tr).toBe(80);
    const alpha = 1 - Math.exp(-7 / 10);
    expect(s[1].tr).toBeCloseTo(80 - alpha, 6);
  });

  it('smooths out a one-off spike', () => {
    const s = trendSeries(weekly([80, 80, 83, 80]));
    expect(s[2].tr).toBeLessThan(82);
  });
});

describe('slope', () => {
  it('needs three weigh-ins across two weeks', () => {
    expect(slope(weekly([80, 79]))).toBeNull();
    expect(
      slope([
        { d: '2026-09-01', kg: 80 },
        { d: '2026-09-02', kg: 79 },
        { d: '2026-09-03', kg: 78 },
      ]),
    ).toBeNull();
  });

  it('measures kg per day', () => {
    const sl = slope(weekly([80, 79.3, 78.6, 77.9]));
    expect(sl).toBeCloseTo(-0.1, 6);
  });
});

describe('projectGoal', () => {
  const now = new Date(2026, 9, 1);

  it('estimates a rough date when heading toward the goal', () => {
    const series = trendSeries(weekly([80, 79.3, 78.6, 77.9, 77.2]));
    expect(projectGoal(series, 74, now)).toMatch(/^(early |mid-|late )[A-Z][a-z]+( \d{4})?$/);
  });

  it('gives nothing when moving away from the goal or flat', () => {
    expect(projectGoal(trendSeries(weekly([80, 80.7, 81.4, 82.1])), 74, now)).toBeNull();
    expect(projectGoal(trendSeries(weekly([80, 80, 80, 80])), 74, now)).toBeNull();
    expect(projectGoal(trendSeries(weekly([80, 79.3, 78.6])), null, now)).toBeNull();
  });
});

describe('deltaTone', () => {
  it('treats loss as good without a goal', () => {
    expect(deltaTone(-1, null, 80)).toBe('good');
    expect(deltaTone(1, null, 80)).toBe('flat');
  });

  it('follows the goal direction', () => {
    expect(deltaTone(1, 85, 80)).toBe('good');
    expect(deltaTone(-1, 85, 80)).toBe('away');
    expect(deltaTone(0.01, 85, 80)).toBe('flat');
  });
});

describe('goalProgress', () => {
  it('reports progress and what is left', () => {
    const ws = weekly([80, 78]);
    const series = trendSeries(ws);
    const g = goalProgress(ws, series, 70);
    expect(g.startKg).toBe(80);
    expect(g.progress).toBeGreaterThan(0);
    expect(g.progress).toBeLessThan(1);
    expect(g.reached).toBe(false);
  });

  it('notices a reached goal', () => {
    const ws = weekly([72, 69.5, 69.5, 69.5, 69.5, 69.5, 69.5]);
    expect(goalProgress(ws, trendSeries(ws), 70).reached).toBe(true);
  });
});

describe('formatting', () => {
  it('formats kilograms', () => {
    expect(formatKg(72.44)).toBe('72.4');
    expect(formatSigned(-1.25)).toBe('−1.3');
    expect(formatSigned(0.4)).toBe('+0.4');
    expect(formatSigned(0.01)).toBe('0.0');
  });

  it('parses commas as decimal points', () => {
    expect(parseKg('72,4')).toBe(72.4);
    expect(parseKg('abc')).toBeNaN();
  });
});
