import { LINES } from '@/domain/content';
import { pick } from '@/domain/lines';

/** A stable line from one of Tunas's sets for a given day. */
export const pickLineFor = (set: keyof typeof LINES, seed: string) => pick(LINES[set], seed);
