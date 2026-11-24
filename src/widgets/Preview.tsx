import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Pressable, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { FlexWidget, OverlapWidget, SvgWidget, TextWidget } from 'react-native-android-widget';
import { SvgXml } from 'react-native-svg';

import type { WidgetRepresentation } from './types';

/**
 * Draws a widget tree with ordinary views, for platforms where the widget library cannot
 * render (the web and iOS). It covers the primitives and style props our widgets use.
 */
type AnyProps = {
  style?: Record<string, unknown>;
  children?: ReactNode;
  clickAction?: string;
  clickActionData?: Record<string, unknown>;
  [k: string]: unknown;
};

const size = (v: unknown) => (v === 'match_parent' ? '100%' : v === 'wrap_content' ? undefined : (v as number | undefined));

function viewStyle(s: Record<string, unknown> = {}): ViewStyle {
  const { width, height, flexGap, flexGapColor, backgroundGradient, ...rest } = s as Record<string, unknown> & {
    backgroundGradient?: { from: string; to: string; orientation: string };
  };
  void flexGapColor;
  const out: Record<string, unknown> = { ...rest, width: size(width), height: size(height) };
  if (flexGap) out.gap = flexGap;
  if (backgroundGradient) out.experimental_backgroundImage = `linear-gradient(${backgroundGradient.from}, ${backgroundGradient.to})`;
  return out as ViewStyle;
}

function unwrap(el: ReactElement<AnyProps>): ReactElement<AnyProps> {
  let cur = el;
  const known = [FlexWidget, OverlapWidget, SvgWidget, TextWidget] as unknown[];
  while (typeof cur.type === 'function' && !known.includes(cur.type)) {
    const next = (cur.type as (p: AnyProps) => ReactNode)(cur.props);
    if (!isValidElement(next)) return cur;
    cur = next as ReactElement<AnyProps>;
  }
  return cur;
}

function draw(node: ReactNode, onClick: (action: string, data?: Record<string, unknown>) => void, key?: number): ReactNode {
  if (!isValidElement(node)) return null;
  const el = unwrap(node as ReactElement<AnyProps>);
  const p = el.props;
  let out: ReactNode;
  if (el.type === TextWidget) {
    out = (
      <Text key={key} numberOfLines={(p.maxLines as number) ?? undefined} style={p.style as TextStyle}>
        {p.text as string}
      </Text>
    );
  } else if (el.type === SvgWidget) {
    const st = (p.style ?? {}) as { width?: number; height?: number };
    out = <SvgXml key={key} xml={p.svg as string} width={st.width} height={st.height} />;
  } else if (el.type === OverlapWidget) {
    out = (
      <View key={key} style={[viewStyle(p.style), { position: 'relative' }]}>
        {Children.toArray(p.children).map((c, i) => (
          <View key={i} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            {draw(c, onClick)}
          </View>
        ))}
      </View>
    );
  } else {
    out = (
      <View key={key} style={viewStyle(p.style)}>
        {Children.toArray(p.children).map((c, i) => draw(c, onClick, i))}
      </View>
    );
  }
  if (p.clickAction) {
    const action = p.clickAction;
    const s = (p.style ?? {}) as Record<string, unknown>;
    return (
      <Pressable
        key={key}
        accessibilityRole="button"
        accessibilityLabel={(p.accessibilityLabel as string) ?? action}
        onPress={() => onClick(action, p.clickActionData)}
        style={{ flex: s.flex as number | undefined, width: size(s.width), height: size(s.height), cursor: 'pointer' } as ViewStyle}
      >
        {out}
      </Pressable>
    );
  }
  return out;
}

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
  const rep = render({ width, height });
  const tree = 'light' in rep ? (dark && rep.dark ? rep.dark : rep.light) : rep;
  return <View style={{ width, height }}>{draw(tree, onClick)}</View>;
}
