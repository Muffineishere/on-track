import { View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Pressy, Txt } from '@/components/ui';
import { DIETS, DIET_IDS } from '@/domain/content';
import { plural } from '@/domain/lines';
import type { Data, DietId } from '@/domain/types';
import { RADIUS, useTheme } from '@/theme';

/** The four plans as a radio list. Used on the Plan tab and during onboarding. */
export function DietList({ value, onChange, data }: { value: DietId; onChange: (id: DietId) => void; data?: Data }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Plan" style={{ gap: 10 }}>
      {DIET_IDS.map((id) => {
        const D = DIETS[id];
        const on = id === value;
        const n = (data?.rules[id] ?? D.rules).length;
        return (
          <Pressy
            key={id}
            role="radio"
            state={{ checked: on, selected: on }}
            label={`${D.name}. ${D.blurb}${n ? `, ${plural(n, 'rule')}` : ''}`}
            feedback="select"
            squash={0.98}
            onPress={() => onChange(id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              padding: 14,
              borderRadius: RADIUS.tile + 2,
              backgroundColor: on ? c.brandSoft : c.surface,
              borderWidth: 2,
              borderColor: on ? c.brandText : c.line,
            }}
          >
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 15,
                backgroundColor: on ? c.brand : c.surface2,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={D.icon} size={24} color={on ? c.onBrand : c.ink2} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt v="bodyBold">{D.name}</Txt>
              <Txt v="footnote" tone="ink2">
                {D.blurb}
                {n ? `, ${plural(n, 'rule')}` : ''}
              </Txt>
            </View>
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                borderWidth: on ? 0 : 2,
                borderColor: c.surface3,
                backgroundColor: on ? c.brand : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {on ? <Icon name="check" size={16} color={c.onBrand} /> : null}
            </View>
          </Pressy>
        );
      })}
    </View>
  );
}
