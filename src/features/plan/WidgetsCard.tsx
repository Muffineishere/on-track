import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, SectionTitle, Txt } from '@/components/ui';
import type { Status } from '@/domain/types';
import { widgetModel } from '@/domain/widget';
import { useNow } from '@/lib/useNow';
import { useActive } from '@/store/data';
import { answerDay } from '@/store/flows';
import { ui } from '@/store/ui';
import { useTheme } from '@/theme';
import { WidgetPreviewBox } from '@/widgets/Preview';
import { renderNamed } from '@/widgets/render';
import { pinWidget, widgetsSupported } from '@/widgets/sync';
import { WIDGETS, type WidgetName } from '@/widgets/widgets';

/** Live previews of the home screen widgets. The faces work here too. */
export function WidgetsCard() {
  const data = useActive();
  const now = useNow();
  const { dark } = useTheme();
  const [width, setWidth] = useState(0);

  const onClick = (action: string, payload?: Record<string, unknown>) => {
    if (action === 'ANSWER' && payload && typeof payload.status === 'string') {
      answerDay(widgetModel(data, now).dayKey, payload.status as Status, { celebrate: true });
    }
  };
  const add = async (name: WidgetName) => {
    const ok = await pinWidget(name);
    if (!ok) ui.toast('Long-press your home screen, tap Widgets, then find On Track');
  };

  const w = Math.min(width, 380);
  const items: { name: WidgetName; w: number; h: number }[] = [
    { name: 'CheckIn', w, h: Math.round(w * 0.46) },
    { name: 'Tunas', w: Math.min(170, w), h: Math.min(170, w) },
    { name: 'Week', w, h: 72 },
  ];

  return (
    <Card>
      <SectionTitle title="Home screen widgets" />
      <Txt v="callout" tone="ink2" style={{ marginBottom: 14 }}>
        {widgetsSupported
          ? 'Log your day without opening the app: tap a face on the check-in widget.'
          : 'On Android, put Tunas on your home screen and log your day with one tap. This is how they look.'}
      </Txt>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ gap: 18 }}>
        {width
          ? items.map((it) => (
              <View key={it.name} style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Txt v="bodyBold">{WIDGETS[it.name].label}</Txt>
                    <Txt v="footnote" tone="ink2">
                      {WIDGETS[it.name].description}
                    </Txt>
                  </View>
                  {widgetsSupported ? (
                    <Button
                      small
                      kind="secondary"
                      icon="plus"
                      title="Add"
                      label={`Add the ${WIDGETS[it.name].label} widget`}
                      onPress={() => add(it.name)}
                    />
                  ) : null}
                </View>
                <View style={{ alignItems: 'center' }} nativeID={`widget-preview-${it.name}`}>
                  <WidgetPreviewBox
                    width={it.w}
                    height={it.h}
                    dark={dark}
                    onClick={onClick}
                    render={({ width: ww, height: hh }) => renderNamed(it.name, data, ww, hh, now)}
                  />
                </View>
              </View>
            ))
          : null}
      </View>
    </Card>
  );
}
