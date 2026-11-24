import { STAGES } from './content';

/** Index into STAGES for a number of good days. */
export function stageOf(goodDays: number) {
  let s = 0;
  for (let i = 0; i < STAGES.length; i++) if (goodDays >= STAGES[i].at) s = i;
  return s;
}

export interface Growth {
  stage: number;
  /** Good days still needed for the next stage, or 0 at the last stage. */
  toNext: number;
  /** Progress through the current stage, 0 to 1. */
  progress: number;
  /** Good days needed for the next stage, or null at the last stage. */
  nextAt: number | null;
}

export function growth(goodDays: number): Growth {
  const stage = stageOf(goodDays);
  const cur = STAGES[stage];
  const next = STAGES[stage + 1];
  if (!next) return { stage, toNext: 0, progress: 1, nextAt: null };
  return {
    stage,
    toNext: next.at - goodDays,
    progress: Math.min(1, Math.max(0, (goodDays - cur.at) / (next.at - cur.at))),
    nextAt: next.at,
  };
}
