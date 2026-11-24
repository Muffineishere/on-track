import { ui, useUI } from '@/store/ui';

import { BackupSheet } from './BackupSheet';
import { Celebrate } from './Celebrate';
import { DaySheet, RecapSheet, StreakSheet, UnlockSheet } from './DaySheets';
import { GoalSheet, ReminderSheet, ResetSheet, RuleSheet, WeightSheet } from './FormSheets';

/** Shows whichever sheet is open; queued sheets follow once it closes. */
export function SheetHost() {
  const s = useUI((st) => st.sheet);
  if (!s) return null;
  const p = { onClosed: ui.closed };
  const k = s.id;
  switch (s.kind) {
    case 'day':
      return <DaySheet key={k} {...p} dayKey={s.key} focusNote={s.focusNote} />;
    case 'celebrate':
      return <Celebrate key={k} {...p} spec={s.spec} />;
    case 'streak':
      return <StreakSheet key={k} {...p} />;
    case 'recap':
      return <RecapSheet key={k} {...p} mon={s.mon} auto={s.auto} />;
    case 'unlock':
      return <UnlockSheet key={k} {...p} outfit={s.outfit} />;
    case 'weight':
      return <WeightSheet key={k} {...p} date={s.date} />;
    case 'goal':
      return <GoalSheet key={k} {...p} />;
    case 'rule':
      return <RuleSheet key={k} {...p} index={s.index} />;
    case 'backup':
      return <BackupSheet key={k} {...p} />;
    case 'reset':
      return <ResetSheet key={k} {...p} />;
    case 'reminder':
      return <ReminderSheet key={k} {...p} />;
  }
}
