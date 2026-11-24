import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInRight, useReducedMotion } from 'react-native-reanimated';

import { Sheet } from '@/components/Sheet';
import { Tunas } from '@/components/tunas/Tunas';
import { Button, Chip, IconButton, Segmented, Txt } from '@/components/ui';
import { formatTime, parseClock, toClock } from '@/domain/dates';
import type { DietId } from '@/domain/types';
import { DietList } from '@/features/plan/DietList';
import { askReminderPermission, remindersSupported } from '@/lib/reminders';
import { store } from '@/store/data';
import { ui } from '@/store/ui';
import { useTheme } from '@/theme';

/** Three short steps: meet Tunas, pick a plan, pick a reminder time. */
export function Onboarding() {
  return (
    <Sheet full dismissable={false} label="Welcome to On Track" onClosed={() => {}}>
      <Steps />
    </Sheet>
  );
}

function Dots({ step }: { step: number }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }} accessible accessibilityLabel={`Step ${step + 1} of 3`}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: i === step ? c.brandText : c.surface3 }}
        />
      ))}
    </View>
  );
}

function Steps() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [diet, setDiet] = useState<DietId>('early');
  const [reminder, setReminder] = useState('21:00');
  const [on, setOn] = useState(true);
  const mins = parseClock(reminder);
  const enter = reduce ? undefined : FadeInRight.duration(280);

  const finish = async () => {
    store.onboard(new Date(), diet, reminder, on);
    if (on && remindersSupported) await askReminderPermission();
    setTimeout(() => ui.tunas({ anim: 'jump', line: 'Hi! I’m Tunas. Let’s grow together.' }), 350);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'space-between', gap: 24 }}>
      <Dots step={step} />
      {step === 0 ? (
        <Animated.View key="s0" entering={enter} style={{ alignItems: 'center', gap: 14 }}>
          <Tunas stage={0} mood="none" outfit={null} size={190} action={{ kind: 'wave', id: 1 }} />
          <Txt v="display" center accessibilityRole="header">
            Meet Tunas
          </Txt>
          <Txt v="body" tone="ink2" center style={{ maxWidth: 330 }}>
            Tunas grows a little every day you stick to your eating plan. Each evening, tell it how the day went with one tap. Bad days
            never undo the good ones.
          </Txt>
        </Animated.View>
      ) : step === 1 ? (
        <Animated.View key="s1" entering={enter} style={{ gap: 16 }}>
          <Txt v="display" accessibilityRole="header">
            Pick your plan
          </Txt>
          <Txt v="body" tone="ink2">
            Each plan comes with a few simple rules. You can change the plan or rewrite the rules any time.
          </Txt>
          <DietList value={diet} onChange={setDiet} />
        </Animated.View>
      ) : (
        <Animated.View key="s2" entering={enter} style={{ gap: 16 }}>
          <Txt v="display" accessibilityRole="header">
            When should Tunas ask?
          </Txt>
          <Txt v="body" tone="ink2">
            Pick the time you usually finish eating. If you’ve already checked in that day, there’s no reminder.
          </Txt>
          <Segmented
            label="Daily reminder"
            value={on ? 'on' : 'off'}
            onChange={(v) => setOn(v === 'on')}
            options={[
              { id: 'on', label: 'Remind me' },
              { id: 'off', label: 'No reminder' },
            ]}
          />
          <View style={{ opacity: on ? 1 : 0.4, gap: 14 }} pointerEvents={on ? 'auto' : 'none'}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <IconButton icon="minus" size={52} label="15 minutes earlier" onPress={() => setReminder(toClock(mins - 15))} />
              <Txt v="number" style={{ minWidth: 150, textAlign: 'center' }} accessibilityLiveRegion="polite">
                {formatTime(mins)}
              </Txt>
              <IconButton icon="plus" size={52} label="15 minutes later" onPress={() => setReminder(toClock(mins + 15))} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              {[19 * 60, 20 * 60, 21 * 60, 22 * 60].map((m) => (
                <Chip key={m} label={formatTime(m)} on={m === mins} onPress={() => setReminder(toClock(m))} />
              ))}
            </View>
          </View>
        </Animated.View>
      )}

      <View style={{ gap: 10 }}>
        {step < 2 ? (
          <Button title={step === 0 ? 'Let’s start' : 'Next'} onPress={() => setStep(step + 1)} />
        ) : (
          <Button title="Start growing" onPress={finish} />
        )}
        {step === 0 ? (
          <Button
            kind="quiet"
            title="Look around with sample data first"
            onPress={() => {
              store.enterDemo(new Date());
              ui.toast('Showing sample data');
            }}
          />
        ) : (
          <Button kind="quiet" title="Back" onPress={() => setStep(step - 1)} />
        )}
      </View>
    </View>
  );
}
