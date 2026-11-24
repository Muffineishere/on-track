import type { Data } from '@/domain/types';

import type { WidgetName } from './widgets';

/** Home screen widgets exist on Android only; elsewhere these do nothing. */
export const widgetsSupported = false;

export async function updateWidgets(_data: Data) {}

export async function pinWidget(_name: WidgetName) {
  return false;
}
