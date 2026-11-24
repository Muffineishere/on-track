import { View } from 'react-native';

import type { Status } from '@/domain/types';
import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';

export const STATUS_ICON: Record<Status, IconName> = { followed: 'check', mostly: 'wave', missed: 'x' };

/** A day's answer as a filled disc: check, wave or cross, and a shield when a free miss covered it. */
export function StatusDisc({ status, forgiven, size = 40 }: { status: Status; forgiven?: boolean; size?: number }) {
  const { c } = useTheme();
  const fill = forgiven ? c.forgiven : c[status];
  const ink = forgiven ? c.onForgiven : status === 'followed' ? c.onFollowed : status === 'mostly' ? c.onMostly : c.onMissed;
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: fill, alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon name={forgiven ? 'shield' : STATUS_ICON[status]} size={Math.round(size * 0.5)} color={ink} />
    </View>
  );
}

export function useStatusColors() {
  const { c } = useTheme();
  return {
    followed: { fill: c.followed, soft: c.followedSoft, text: c.followedText, on: c.onFollowed },
    mostly: { fill: c.mostly, soft: c.mostlySoft, text: c.mostlyText, on: c.onMostly },
    missed: { fill: c.missed, soft: c.missedSoft, text: c.missedText, on: c.onMissed },
  } satisfies Record<Status, { fill: string; soft: string; text: string; on: string }>;
}
