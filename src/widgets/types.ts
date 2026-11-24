import type { JSX } from 'react';

export type WidgetRepresentation = JSX.Element | { light: JSX.Element; dark: JSX.Element | null };
