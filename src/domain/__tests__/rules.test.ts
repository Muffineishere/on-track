import { cutoffInfo, planCutoff, ruleCutoff, suggestion } from '../rules';
import { fresh } from '../state';

describe('ruleCutoff', () => {
  it.each([
    ['Last meal by 6pm', 18 * 60],
    ['No supper after 9pm', 21 * 60],
    ['Last meal by 7:30pm', 19 * 60 + 30],
    ['Stop eating before 8', 20 * 60],
    ['Kitchen closes until 12pm', 12 * 60],
    ['Dinner done at 7 pm', 19 * 60],
  ])('reads "%s"', (text, mins) => {
    expect(ruleCutoff(text)).toBe(mins);
  });

  it.each(['Drink 2 litres of water', 'Breakfast by 7am', 'Fast until 12am', 'Half the plate is vegetables'])(
    'finds no cutoff in "%s"',
    (text) => {
      expect(ruleCutoff(text)).toBeNull();
    },
  );

  it('does not match numbers inside words or measures', () => {
    expect(ruleCutoff('Fried food twice a week at most')).toBeNull();
  });
});

describe('planCutoff', () => {
  it('picks the earliest cutoff', () => {
    expect(planCutoff(['No supper after 9pm', 'Last meal by 6pm'])).toBe(18 * 60);
  });

  it('is null when no rule has a time', () => {
    expect(planCutoff(['No sweet drinks'])).toBeNull();
  });
});

describe('cutoffInfo', () => {
  const sixPm = 18 * 60;

  it('is open well before the cutoff', () => {
    expect(cutoffInfo(sixPm, new Date(2026, 10, 24, 12, 0))).toMatchObject({ tone: 'open', text: 'Kitchen open until 6pm' });
  });

  it('counts down in the last three hours', () => {
    expect(cutoffInfo(sixPm, new Date(2026, 10, 24, 16, 40))).toMatchObject({ tone: 'soon', text: 'Kitchen closes in 1h 20m', left: 80 });
  });

  it('is closed after the cutoff', () => {
    expect(cutoffInfo(sixPm, new Date(2026, 10, 24, 19, 0))).toMatchObject({ tone: 'closed', text: 'Kitchen closed at 6pm' });
  });
});

describe('suggestion', () => {
  const key = '2026-11-24';

  it('suggests Followed when every rule is ticked', () => {
    const d = fresh();
    d.diet = 'custom';
    d.rules.custom = ['A', 'B'];
    d.ticks[key] = ['A', 'B'];
    expect(suggestion(d, key)).toBe('followed');
  });

  it('suggests Mostly at half or more', () => {
    const d = fresh();
    d.diet = 'custom';
    d.rules.custom = ['A', 'B', 'C', 'D'];
    d.ticks[key] = ['A', 'C'];
    expect(suggestion(d, key)).toBe('mostly');
  });

  it('stays quiet with few or no ticks', () => {
    const d = fresh();
    expect(suggestion(d, key)).toBeNull();
    d.ticks[key] = [d.rules.early?.[0] ?? 'Small breakfast with protein, like eggs or tempeh'];
    expect(suggestion(d, key)).toBeNull();
  });
});
