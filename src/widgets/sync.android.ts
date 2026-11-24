import { requestPinWidget, requestWidgetUpdate } from 'react-native-android-widget';

import type { Data } from '@/domain/types';

import { renderNamed } from './render';
import { WIDGETS, type WidgetName } from './widgets';

export const widgetsSupported = true;

/** Redraws every placed widget from the app's current data. */
export async function updateWidgets(data: Data) {
  const now = new Date();
  for (const name of Object.keys(WIDGETS) as WidgetName[]) {
    try {
      await requestWidgetUpdate({ widgetName: name, renderWidget: (info) => renderNamed(name, data, info.width, info.height, now) });
    } catch {
      // A launcher without widgets is fine.
    }
  }
}

/** Asks the launcher to place a widget on the home screen. Returns false if it can't. */
export async function pinWidget(name: WidgetName) {
  try {
    return await requestPinWidget({ widgetName: name });
  } catch {
    return false;
  }
}
