import { useEffect, useState } from 'react';
import { Linking, TextInput, View } from 'react-native';

import { IconButton, Button, Chip, Segmented, Txt } from '@/components/ui';
import { Sheet, useSheet } from '@/components/Sheet';
import { TunasStill } from '@/components/tunas/Tunas';
import { addDays, formatLong, formatTime, fromKey, keyOf, parseClock, startOfDay, toClock } from '@/domain/dates';
import { rulesFor, validKg } from '@/domain/state';
import type { DayKey } from '@/domain/types';
import { formatKg, parseKg } from '@/domain/weight';
import { removeRule, saveRule } from '@/features/plan/ruleActions';
import { haptic } from '@/lib/haptics';
import { askReminderPermission, reminderPermission, remindersSupported, type PermissionState } from '@/lib/reminders';
import { snapshot, store, useActive, useDataStore } from '@/store/data';
import { ui } from '@/store/ui';
import { FONT, RADIUS, useTheme } from '@/theme';

import { KgField, SheetHeader } from './common';

/* ---------- Weigh-in ---------- */

export function WeightSheet({ date, onClosed }: { date?: DayKey; onClosed: () => void }) {
  return (
    <Sheet label="Weigh-in" onClosed={onClosed}>
      <WeightBody initial={date} />
    </Sheet>
  );
}

function WeightBody({ initial }: { initial?: DayKey }) {
  const { c } = useTheme();
  const sheet = useSheet();
  const data = useActive();
  const today = keyOf(startOfDay(new Date()));
  const [day, setDay] = useState(initial ?? today);
  const existing = data.weights.find((w) => w.d === day);
  const last = data.weights[data.weights.length - 1];
  const [value, setValue] = useState(existing ? formatKg(existing.kg) : last ? formatKg(last.kg) : '');
  const [err, setErr] = useState('');

  const moveDay = (n: number) => {
    const next = keyOf(addDays(fromKey(day), n));
    if (next > today) return;
    setDay(next);
    const e = data.weights.find((w) => w.d === next);
    if (e) setValue(formatKg(e.kg));
    setErr('');
  };
  const save = () => {
    const n = parseKg(value);
    if (!validKg(n)) {
      setErr('Enter a weight between 25 and 300 kg.');
      haptic.warn();
      return;
    }
    store.setWeight(day, n);
    haptic.success();
    sheet.close();
    ui.toast('Weight saved');
  };
  return (
    <>
      <SheetHeader
        title={existing ? (day === today ? 'Today’s weight' : 'Edit weigh-in') : 'Log weight'}
        sub="Best in the morning, before breakfast."
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <IconButton icon="chevron-left" label="Day before" onPress={() => moveDay(-1)} />
        <Txt v="bodyBold" center style={{ minWidth: 190 }} accessibilityLiveRegion="polite">
          {day === today ? 'Today' : formatLong(fromKey(day))}
        </Txt>
        <IconButton icon="chevron-right" label="Day after" onPress={() => moveDay(1)} tint={day === today ? c.surface3 : c.ink} />
      </View>
      <KgField value={value} onChange={(v) => (setValue(v), setErr(''))} label="Weight in kilograms" onSubmit={save} />
      {err ? (
        <Txt v="calloutBold" tone="danger" center accessibilityLiveRegion="assertive">
          {err}
        </Txt>
      ) : null}
      <Button title="Save" onPress={save} />
      {existing ? (
        <Button
          kind="danger"
          title="Delete this weigh-in"
          onPress={() => {
            const snap = snapshot();
            store.deleteWeight(day);
            sheet.close();
            ui.toast('Weigh-in deleted', () => store.restore(snap));
          }}
        />
      ) : null}
    </>
  );
}

/* ---------- Goal ---------- */

export function GoalSheet({ onClosed }: { onClosed: () => void }) {
  return (
    <Sheet label="Goal weight" onClosed={onClosed}>
      <GoalBody />
    </Sheet>
  );
}

function GoalBody() {
  const sheet = useSheet();
  const data = useActive();
  const last = data.weights[data.weights.length - 1];
  const [value, setValue] = useState(data.goal != null ? formatKg(data.goal) : last ? formatKg(Math.round((last.kg - 3) * 2) / 2) : '');
  const [err, setErr] = useState('');
  const save = () => {
    const n = parseKg(value);
    if (!validKg(n)) {
      setErr('Enter a goal between 25 and 300 kg.');
      haptic.warn();
      return;
    }
    store.setGoal(n);
    sheet.close();
    ui.toast('Goal saved');
  };
  return (
    <>
      <SheetHeader title="Goal weight" sub="A goal you can reach in a few months works best. You can change it any time." />
      <KgField value={value} onChange={(v) => (setValue(v), setErr(''))} label="Goal in kilograms" onSubmit={save} />
      {err ? (
        <Txt v="calloutBold" tone="danger" center accessibilityLiveRegion="assertive">
          {err}
        </Txt>
      ) : null}
      <Button title="Save goal" onPress={save} />
      {data.goal != null ? (
        <Button
          kind="quiet"
          title="Remove goal"
          onPress={() => {
            const snap = snapshot();
            store.setGoal(null);
            sheet.close();
            ui.toast('Goal removed', () => store.restore(snap));
          }}
        />
      ) : null}
    </>
  );
}

/* ---------- One rule ---------- */

export function RuleSheet({ index, onClosed }: { index: number; onClosed: () => void }) {
  return (
    <Sheet label={index < 0 ? 'New rule' : 'Edit rule'} onClosed={onClosed}>
      <RuleBody index={index} />
    </Sheet>
  );
}

function RuleBody({ index }: { index: number }) {
  const { c } = useTheme();
  const sheet = useSheet();
  const data = useActive();
  const [text, setText] = useState(index >= 0 ? (rulesFor(data)[index] ?? '') : '');
  const save = () => {
    if (saveRule(index, text)) sheet.close();
  };
  return (
    <>
      <SheetHeader
        title={index < 0 ? 'New rule' : 'Edit rule'}
        sub="Short and specific works best, like “Last meal by 7pm”. Add a time and Tunas counts down to it."
      />
      <Txt v="calloutBold" tone="ink2" style={{ marginBottom: -10 }}>
        Rule
      </Txt>
      <TextInput
        value={text}
        onChangeText={setText}
        autoFocus
        maxLength={120}
        returnKeyType="done"
        onSubmitEditing={save}
        placeholder="No sweet drinks after lunch"
        placeholderTextColor={c.ink3}
        accessibilityLabel="Rule"
        style={{
          minHeight: 56,
          paddingHorizontal: 16,
          borderRadius: RADIUS.control,
          backgroundColor: c.surface,
          borderWidth: 1,
          borderColor: c.line,
          color: c.ink,
          fontFamily: FONT.bold,
          fontSize: 17,
        }}
      />
      <Button title={index < 0 ? 'Add rule' : 'Save'} onPress={save} disabled={!text.trim()} />
      {index >= 0 ? (
        <Button
          kind="danger"
          title="Delete rule"
          onPress={() => {
            sheet.close();
            removeRule(index);
          }}
        />
      ) : null}
    </>
  );
}

/* ---------- Start over ---------- */

export function ResetSheet({ onClosed }: { onClosed: () => void }) {
  return (
    <Sheet label="Start over" onClosed={onClosed}>
      <ResetBody />
    </Sheet>
  );
}

function ResetBody() {
  const sheet = useSheet();
  const demo = useDataStore((s) => s.demo !== null);
  return (
    <>
      <SheetHeader
        art={<TunasStill stage={0} mood="missed" outfit={null} size={110} />}
        title="Start over?"
        sub="Every answer, weigh-in, note, outfit and edited rule will be removed, and Tunas goes back to a seed. You can undo straight after."
      />
      <Button
        kind="danger"
        title="Clear everything"
        onPress={() => {
          const snap = structuredClone(useDataStore.getState().data);
          store.reset(new Date());
          sheet.close();
          ui.tunas({ line: 'A fresh start. Let’s grow again.' });
          ui.toast('All data cleared', () => store.replaceAll(snap));
        }}
      />
      <Button kind="secondary" title="Keep my data" onPress={sheet.close} />
      {demo ? (
        <Txt v="footnote" tone="ink2" center>
          This clears your own data, not just the sample.
        </Txt>
      ) : null}
    </>
  );
}

/* ---------- Reminder ---------- */

export function ReminderSheet({ onClosed }: { onClosed: () => void }) {
  return (
    <Sheet label="Daily reminder" onClosed={onClosed}>
      <ReminderBody />
    </Sheet>
  );
}

function ReminderBody() {
  const { c } = useTheme();
  const sheet = useSheet();
  const data = useActive();
  const [perm, setPerm] = useState<PermissionState>('undetermined');
  const mins = parseClock(data.reminder);
  useEffect(() => {
    reminderPermission().then(setPerm);
  }, []);
  const setMins = (m: number) => store.setReminder(toClock(m));
  const turnOn = async (on: boolean) => {
    store.setReminderOn(on);
    if (on && remindersSupported) setPerm(await askReminderPermission());
  };
  return (
    <>
      <SheetHeader
        title="Daily reminder"
        sub="One gentle nudge at the time you usually finish eating. No reminder on days you’ve already checked in."
      />
      {!remindersSupported ? (
        <View style={{ padding: 14, borderRadius: RADIUS.tile, backgroundColor: c.mostlySoft }}>
          <Txt v="callout">Reminders come from the phone app. A browser can’t send them, so this setting only takes effect on a phone.</Txt>
        </View>
      ) : null}
      <Segmented
        label="Reminder"
        value={data.reminderOn ? 'on' : 'off'}
        onChange={(v) => turnOn(v === 'on')}
        options={[
          { id: 'on', label: 'On' },
          { id: 'off', label: 'Off' },
        ]}
      />
      <View style={{ opacity: data.reminderOn ? 1 : 0.45, gap: 14 }} pointerEvents={data.reminderOn ? 'auto' : 'none'}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <IconButton icon="minus" label="15 minutes earlier" size={52} onPress={() => setMins(mins - 15)} />
          <Txt
            v="number"
            style={{ minWidth: 150, textAlign: 'center' }}
            accessibilityLiveRegion="polite"
            accessibilityLabel={`Reminder at ${formatTime(mins)}`}
          >
            {formatTime(mins)}
          </Txt>
          <IconButton icon="plus" label="15 minutes later" size={52} onPress={() => setMins(mins + 15)} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {[19 * 60, 20 * 60, 21 * 60, 22 * 60].map((m) => (
            <Chip key={m} label={formatTime(m)} on={m === mins} onPress={() => setMins(m)} />
          ))}
        </View>
      </View>
      {remindersSupported && data.reminderOn && perm === 'denied' ? (
        <View style={{ padding: 14, borderRadius: RADIUS.tile, backgroundColor: c.mostlySoft, gap: 10 }}>
          <Txt v="callout">Notifications are turned off for On Track, so the reminder can’t show. You can turn them on in Settings.</Txt>
          <Button small kind="secondary" title="Open Settings" onPress={() => Linking.openSettings()} />
        </View>
      ) : null}
      <Button title="Done" onPress={sheet.close} />
    </>
  );
}
