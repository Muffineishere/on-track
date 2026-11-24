import { WidgetPreview } from 'react-native-android-widget';

import type { WidgetRepresentation } from './types';

/** On Android the widget library draws the real widget, exactly as the home screen shows it. */
export function WidgetPreviewBox({
  render,
  width,
  height,
  dark,
  onClick,
}: {
  render: (size: { width: number; height: number }) => WidgetRepresentation;
  width: number;
  height: number;
  dark: boolean;
  onClick: (action: string, data?: Record<string, unknown>) => void;
}) {
  return (
    <WidgetPreview
      width={width}
      height={height}
      renderWidget={(size) => {
        const rep = render(size);
        return 'light' in rep ? (dark && rep.dark ? rep.dark : rep.light) : rep;
      }}
      onClick={({ clickAction, clickActionData }) => onClick(clickAction, clickActionData)}
    />
  );
}
