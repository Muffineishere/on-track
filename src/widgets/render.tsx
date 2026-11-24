'use no memo';
import type { Data } from '@/domain/types';
import { widgetModel } from '@/domain/widget';

import { CheckInWidget, TunasWidget, WeekWidget, type WidgetName } from './widgets';

/** Builds the widget for a name and size from the saved data, in both themes where it matters. */
export function renderNamed(name: WidgetName | string, data: Data, width: number, height: number, now: Date = new Date()) {
  const m = widgetModel(data, now);
  if (name === 'Week') return { light: <WeekWidget m={m} theme="light" />, dark: <WeekWidget m={m} theme="dark" /> };
  if (name === 'Tunas') return <TunasWidget m={m} width={width} height={height} />;
  return <CheckInWidget m={m} width={width} height={height} />;
}
