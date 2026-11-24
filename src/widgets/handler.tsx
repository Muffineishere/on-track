'use no memo';
import { requestWidgetUpdate, type WidgetTaskHandlerProps } from 'react-native-android-widget';

import type { Status } from '@/domain/types';
import { applyAnswer, widgetModel } from '@/domain/widget';
import { syncReminders } from '@/lib/reminders';
import { useDataStore } from '@/store/data';

import { renderNamed } from './render';
import { readSaved, writeSaved } from './storage';
import { WIDGETS, type WidgetName } from './widgets';

const isStatus = (v: unknown): v is Status => v === 'followed' || v === 'mostly' || v === 'missed';

/**
 * Runs whenever Android asks a widget to draw itself or a widget button is tapped, even
 * when the app is closed. A tapped face saves the answer straight into the app's storage.
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetInfo, widgetAction, clickAction, clickActionData } = props;
  if (widgetAction === 'WIDGET_DELETED') return;
  const now = new Date();
  let data = await readSaved();

  if (widgetAction === 'WIDGET_CLICK' && clickAction === 'ANSWER' && data.onboarded) {
    const status = clickActionData?.status;
    if (isStatus(status)) {
      const key = widgetModel(data, now).dayKey;
      if (data.log[key] !== status) {
        data = applyAnswer(data, key, status, now);
        await writeSaved(data);
        // If the app is running in this process, show the new answer there too.
        await useDataStore.persist.rehydrate();
        await syncReminders(data, now);
        // Keep the other widgets in step.
        const latest = data;
        for (const name of Object.keys(WIDGETS) as WidgetName[]) {
          if (name === widgetInfo.widgetName) continue;
          await requestWidgetUpdate({ widgetName: name, renderWidget: (info) => renderNamed(name, latest, info.width, info.height, now) });
        }
      }
    }
  }

  props.renderWidget(renderNamed(widgetInfo.widgetName, data, widgetInfo.width, widgetInfo.height, now));
}
