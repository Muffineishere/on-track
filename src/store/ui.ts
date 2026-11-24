import { create } from 'zustand';

import type { DayKey, OutfitId, Status } from '@/domain/types';

export interface CelebrationSpec {
  key: DayKey;
  status: Status;
  before: { good: number; streak: number; stage: number };
  grew: boolean;
  flowered: boolean;
  bestStreak: boolean;
}

export type SheetSpec =
  | { kind: 'day'; key: DayKey; focusNote?: boolean }
  | { kind: 'celebrate'; spec: CelebrationSpec }
  | { kind: 'streak' }
  | { kind: 'recap'; mon: DayKey; auto: boolean }
  | { kind: 'unlock'; outfit: OutfitId }
  | { kind: 'weight'; date?: DayKey }
  | { kind: 'goal' }
  | { kind: 'rule'; index: number }
  | { kind: 'backup' }
  | { kind: 'reset' }
  | { kind: 'reminder' };

export type TunasAnim = 'jump' | 'nod' | 'boing' | 'wave';

interface Toast {
  id: number;
  text: string;
  undo?: () => void;
}

interface UIState {
  sheet: (SheetSpec & { id: number }) | null;
  queue: SheetSpec[];
  toast: Toast | null;
  /** A one-off reaction for Tunas on the Today screen. */
  tunas: { id: number; anim?: TunasAnim; line?: string; hearts?: number } | null;
}

let seq = 1;

export const useUI = create<UIState>()(() => ({ sheet: null, queue: [], toast: null, tunas: null }));

export const ui = {
  open(s: SheetSpec) {
    useUI.setState({ sheet: { ...s, id: seq++ } });
  },
  /** Opens now, or after the sheets already showing. */
  enqueue(s: SheetSpec) {
    const st = useUI.getState();
    if (!st.sheet) ui.open(s);
    else if (!st.queue.some((q) => q.kind === s.kind)) useUI.setState({ queue: [...st.queue, s] });
  },
  /** Called once a sheet has finished animating away. */
  closed() {
    const [next, ...rest] = useUI.getState().queue;
    useUI.setState({ sheet: next ? { ...next, id: seq++ } : null, queue: rest });
  },
  toast(text: string, undo?: () => void) {
    useUI.setState({ toast: { id: seq++, text, undo } });
  },
  hideToast(id?: number) {
    const t = useUI.getState().toast;
    if (t && (id == null || t.id === id)) useUI.setState({ toast: null });
  },
  tunas(r: { anim?: TunasAnim; line?: string; hearts?: number }) {
    useUI.setState({ tunas: { ...r, id: seq++ } });
  },
};
