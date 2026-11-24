import { DIETS } from '@/domain/content';
import { rulesFor } from '@/domain/state';
import type { DietId } from '@/domain/types';
import { haptic } from '@/lib/haptics';
import { getActive, snapshot, store } from '@/store/data';
import { ui } from '@/store/ui';

const has = (list: string[], text: string, except = -1) => list.some((x, i) => i !== except && x.toLowerCase() === text.toLowerCase());

export function addRule(text: string) {
  const t = text.trim();
  if (!t) return false;
  const list = rulesFor(getActive());
  if (has(list, t)) {
    ui.toast('That rule is already on your list');
    return false;
  }
  const snap = snapshot();
  store.setRules([...list, t]);
  haptic.tap();
  ui.toast('Rule added', () => store.restore(snap));
  return true;
}

export function saveRule(index: number, text: string) {
  const t = text.trim();
  if (!t) return false;
  const list = rulesFor(getActive()).slice();
  if (has(list, t, index)) {
    ui.toast('That rule is already on your list');
    return false;
  }
  const snap = snapshot();
  if (index < 0) list.push(t);
  else list[index] = t;
  store.setRules(list);
  ui.toast(index < 0 ? 'Rule added' : 'Rule saved', () => store.restore(snap));
  return true;
}

export function removeRule(index: number) {
  const snap = snapshot();
  const list = rulesFor(getActive()).slice();
  list.splice(index, 1);
  store.setRules(list);
  haptic.tap();
  ui.toast('Rule removed', () => store.restore(snap));
}

export function switchDiet(id: DietId) {
  const prev = getActive().diet;
  if (prev === id) return;
  store.setDiet(id);
  ui.toast(`Switched to ${DIETS[id].name}`, () => store.setDiet(prev));
}
