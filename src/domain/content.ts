import type { DietId, OutfitId, SlipId, Status } from './types';

/** Icon names used by domain content. The Icon component draws each one. */
export type ContentIcon = 'sunrise' | 'trend-down' | 'egg' | 'pencil' | 'moon' | 'cup' | 'bowl' | 'plate' | 'people' | 'cloud' | 'dots';

export interface Diet {
  id: DietId;
  name: string;
  blurb: string;
  icon: ContentIcon;
  rules: string[];
}

export const DIETS: Record<DietId, Diet> = {
  early: {
    id: 'early',
    name: 'Small breakfast, lunch, no dinner',
    blurb: 'Eat early and stop by evening',
    icon: 'sunrise',
    rules: [
      'Small breakfast with protein, like eggs or tempeh',
      'Proper lunch with protein, vegetables and some rice',
      'Last meal by 6pm',
      'No sweet drinks: teh tarik, bubble tea, soft drinks',
      'Hungry at night? Water, fruit or a boiled egg only',
    ],
  },
  loss: {
    id: 'loss',
    name: 'Steady weight loss',
    blurb: 'Three smaller meals with fewer extras',
    icon: 'trend-down',
    rules: [
      'Half the plate is vegetables',
      'One scoop of rice, not two',
      'No sweet drinks',
      'Fried food twice a week at most',
      'No supper after 9pm',
    ],
  },
  protein: {
    id: 'protein',
    name: 'High protein',
    blurb: 'Protein first at every meal',
    icon: 'egg',
    rules: [
      'Protein at every meal',
      'Grilled or steamed instead of fried',
      'Snack on eggs, yogurt or soy milk',
      'Kuih and sweet snacks only on weekends',
      'Drink 2 litres of water',
    ],
  },
  custom: { id: 'custom', name: 'My own rules', blurb: 'Write your own list', icon: 'pencil', rules: [] },
};

export const DIET_IDS = Object.keys(DIETS) as DietId[];

export interface Stage {
  at: number;
  name: string;
  label: string;
  /** What Tunas does next, finishing "until Tunas can ...". Null at the last stage. */
  next: string | null;
}

export const STAGES: Stage[] = [
  { at: 0, name: 'Seed', label: 'Tunas the seed', next: 'sprout' },
  { at: 1, name: 'Sprout', label: 'Tunas the sprout', next: 'grow a second leaf' },
  { at: 7, name: 'Seedling', label: 'Tunas the seedling', next: 'bloom' },
  { at: 30, name: 'Blooming', label: 'Tunas in bloom', next: 'become a little tree' },
  { at: 100, name: 'Little tree', label: 'Tunas the little tree', next: null },
];

export interface Outfit {
  id: OutfitId;
  name: string;
  at: number;
}

export const OUTFITS: Outfit[] = [
  { id: 'crown', name: 'Leaf crown', at: 7 },
  { id: 'shades', name: 'Sunglasses', at: 14 },
  { id: 'songkok', name: 'Songkok', at: 30 },
  { id: 'scarf', name: 'Cosy scarf', at: 60 },
  { id: 'can', name: 'Watering can', at: 100 },
];

export const STATUS_LABEL: Record<Status, string> = { followed: 'Followed', mostly: 'Mostly', missed: 'Missed' };
export const STATUSES: Status[] = ['followed', 'mostly', 'missed'];

export interface Slip {
  id: SlipId;
  label: string;
  icon: ContentIcon;
  /** A rule that helps with this slip. Empty when there is no obvious one. */
  fix: string;
}

export const SLIPS: Slip[] = [
  { id: 'late', label: 'Late snack', icon: 'moon', fix: 'No supper after 9pm' },
  { id: 'sweet', label: 'Sweet drink', icon: 'cup', fix: 'No sweet drinks' },
  { id: 'out', label: 'Ate out', icon: 'bowl', fix: 'Eating out? Pick soup, grilled or steamed dishes' },
  { id: 'hungry', label: 'Too hungry', icon: 'plate', fix: 'Protein at every meal' },
  { id: 'social', label: 'Social event', icon: 'people', fix: 'Before a kenduri or party, eat a small healthy meal first' },
  { id: 'stress', label: 'Stressed or tired', icon: 'cloud', fix: 'Keep fruit or nuts nearby for tired moments' },
  { id: 'other', label: 'Something else', icon: 'dots', fix: '' },
];

export const SLIP_IDS = SLIPS.map((s) => s.id);
export const slipOf = (id: SlipId | undefined | null) => SLIPS.find((s) => s.id === id) ?? null;

export const SUGGESTED_RULES = [
  'No sweet drinks',
  'Drink 2 litres of water',
  'No fried food on weekdays',
  'Last meal by 7pm',
  'Half the plate is vegetables',
  'No supper after 9pm',
  'Protein at every meal',
  'One scoop of rice, not two',
  'Fruit instead of kuih',
];

export const LINES = {
  morning: ['Good morning! Here’s today’s plan.', 'New day, new leaf.', 'Morning! Let’s make it a good one.'],
  morningEarly: ['Morning! Small breakfast, big lunch.'],
  day: ['You’ve got this. Stick to the plan.', 'Halfway there. Keep going.', 'Doing great so far.'],
  dayEarly: ['Lunch is the big meal today.'],
  evening: ['How did today go?', 'Yawn… tell me about your day.', 'Day’s done. How did we do?'],
  late: ['Still up? Tell me how yesterday went.', 'Before bed: how did yesterday go?'],
  followed: ['Mantap! Another good day.', 'Yay, I’m growing!', 'That’s the way. Proud of you.'],
  mostly: ['Not perfect, still counts.', 'One slip is fine. We keep going.', 'Close enough. I still grew!'],
  missed: ['It’s okay. We go again tomorrow.', 'Rest today, grow tomorrow.', 'One day doesn’t undo the rest.'],
  poke: ['Hehe, that tickles.', 'Hi! I’m Tunas.', 'Water me with good days.', 'Boop.', 'I like it here.'],
  pet: ['Aww, thank you!', 'Hehe, I love cuddles.', 'That feels nice.'],
  ticked: ['Every rule kept so far!', 'All ticked. Look at you go.'],
};

/** Reminder notification copy, rotated by day. */
export const REMINDER_LINES = [
  'How did today go? One tap is all it takes.',
  'Tunas wants to hear about your day.',
  'Before bed: Followed, Mostly or Missed?',
  'A quick check-in keeps your streak fair.',
];
