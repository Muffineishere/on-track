import { makeSample } from '../sample';
import { fresh } from '../state';
import { applyAnswer, widgetModel } from '../widget';

const EVENING = new Date(2026, 10, 24, 20, 0);

describe('applyAnswer', () => {
  it('records the answer without touching the original', () => {
    const d = fresh();
    d.slips['2026-11-24'] = 'late';
    const next = applyAnswer(d, '2026-11-24', 'mostly', EVENING);
    expect(next.log['2026-11-24']).toBe('mostly');
    expect(next.slips['2026-11-24']).toBe('late');
    expect(d.log['2026-11-24']).toBeUndefined();
  });

  it('drops the slip reason for a Followed day', () => {
    const d = fresh();
    d.slips['2026-11-24'] = 'late';
    expect(applyAnswer(d, '2026-11-24', 'followed', EVENING).slips['2026-11-24']).toBeUndefined();
  });
});

describe('widgetModel', () => {
  it('asks to start when not onboarded', () => {
    expect(widgetModel(fresh(), EVENING)).toMatchObject({ onboarded: false, title: 'Meet Tunas' });
  });

  it('asks for the evening check-in', () => {
    const m = widgetModel(makeSample(EVENING), EVENING);
    expect(m).toMatchObject({ status: null, mood: 'evening', title: 'How did today go?', dayKey: '2026-11-24', dayLabel: 'today' });
    expect(m.week).toHaveLength(7);
    expect(m.week[1]).toMatchObject({ letter: 'T', today: true });
    expect(m.streak).toBeGreaterThan(0);
  });

  it('celebrates after an answer', () => {
    const d = applyAnswer(makeSample(EVENING), '2026-11-24', 'followed', EVENING);
    const m = widgetModel(d, EVENING);
    expect(m.status).toBe('followed');
    expect(m.mood).toBe('followed');
    expect(m.subtitle).toBe('Followed today');
  });

  it('answers yesterday after midnight', () => {
    const late = new Date(2026, 10, 25, 1, 0);
    const m = widgetModel(makeSample(EVENING), late);
    expect(m.dayKey).toBe('2026-11-24');
    expect(m.title).toBe('How was Tuesday?');
  });
});
