import { useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { Confetti } from '@/components/Confetti';
import { Icon } from '@/components/Icon';
import { Sheet, useSheet } from '@/components/Sheet';
import { Tunas, TunasStill } from '@/components/tunas/Tunas';
import { Button, Txt } from '@/components/ui';
import { OUTFITS, slipOf } from '@/domain/content';
import { formatLong, formatShort, fromKey, keyOf, weekRange, mondayOf } from '@/domain/dates';
import { plural } from '@/domain/lines';
import { weekWeightChange } from '@/domain/recap';
import { stageOf } from '@/domain/stage';
import { countGood } from '@/domain/state';
import { streak, topSlip, weekInfo } from '@/domain/streak';
import type { DayKey, OutfitId } from '@/domain/types';
import { formatSigned } from '@/domain/weight';
import { AnswerTiles } from '@/features/today/cards';
import { store, useActive } from '@/store/data';
import { answerDay } from '@/store/flows';
import { ui } from '@/store/ui';
import { FONT, RADIUS, useTheme } from '@/theme';

import { SheetHeader, SlipChips } from './common';

/* ---------- One day: answer, slip and note ---------- */

export function DaySheet({ dayKey, focusNote, onClosed }: { dayKey: DayKey; focusNote?: boolean; onClosed: () => void }) {
  const data = useActive();
  const [note, setNote] = useState(data.notes[dayKey] ?? '');
  const noteRef = useRef(note);
  useEffect(() => {
    noteRef.current = note;
  }, [note]);
  const flush = () => {
    if ((data.notes[dayKey] ?? '') !== noteRef.current.trim()) store.setNote(dayKey, noteRef.current);
  };
  return (
    <Sheet label={`Edit ${formatLong(fromKey(dayKey))}`} onClosed={onClosed} onDismiss={flush}>
      <DayBody dayKey={dayKey} focusNote={focusNote} note={note} setNote={setNote} flush={flush} />
    </Sheet>
  );
}

function DayBody({
  dayKey,
  focusNote,
  note,
  setNote,
  flush,
}: {
  dayKey: DayKey;
  focusNote?: boolean;
  note: string;
  setNote: (v: string) => void;
  flush: () => void;
}) {
  const { c } = useTheme();
  const sheet = useSheet();
  const data = useActive();
  const s = data.log[dayKey];
  const st = streak(data, new Date());
  const isToday = dayKey === keyOf(new Date());
  const sub = !s
    ? 'No answer yet. One tap is enough.'
    : s === 'missed' && st.forgiven[dayKey]
      ? 'A free miss covered this day, so your streak kept going.'
      : s === 'missed'
        ? 'No free miss was left that week.'
        : 'This counts as a good day.';

  // Save the note a moment after typing stops.
  useEffect(() => {
    const t = setTimeout(flush, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note]);

  return (
    <>
      <SheetHeader title={isToday ? `Today, ${formatShort(fromKey(dayKey))}` : formatLong(fromKey(dayKey))} sub={sub} />
      <AnswerTiles current={s} onAnswer={(v) => v !== s && answerDay(dayKey, v)} />
      {s && s !== 'followed' ? (
        <View style={{ gap: 10 }}>
          <Txt v="calloutBold" tone="ink2">
            What tripped you up?
          </Txt>
          <SlipChips value={data.slips[dayKey]} onPick={(id) => store.toggleSlip(dayKey, id)} />
        </View>
      ) : null}
      <View style={{ gap: 8 }}>
        <Txt v="calloutBold" tone="ink2" nativeID="note-label">
          Note
        </Txt>
        <TextInput
          value={note}
          onChangeText={setNote}
          onBlur={flush}
          autoFocus={focusNote}
          multiline
          maxLength={200}
          placeholder="Anything worth remembering? A kenduri, a busy day…"
          placeholderTextColor={c.ink3}
          accessibilityLabel="Note"
          aria-labelledby="note-label"
          style={{
            minHeight: 88,
            padding: 14,
            borderRadius: RADIUS.control,
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: c.line,
            color: c.ink,
            fontFamily: FONT.semibold,
            fontSize: 16,
            textAlignVertical: 'top',
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {s ? (
          <Button
            kind="danger"
            title="Clear answer"
            style={{ flex: 1 }}
            onPress={() => {
              flush();
              sheet.close();
              answerDay(dayKey, null);
            }}
          />
        ) : null}
        <Button
          title="Done"
          style={{ flex: 1 }}
          onPress={() => {
            flush();
            sheet.close();
          }}
        />
      </View>
    </>
  );
}

/* ---------- Streak details ---------- */

export function StreakSheet({ onClosed }: { onClosed: () => void }) {
  return (
    <Sheet label="Streak" onClosed={onClosed}>
      <StreakBody />
    </Sheet>
  );
}

function StreakBody() {
  const { c } = useTheme();
  const sheet = useSheet();
  const st = streak(useActive(), new Date());
  return (
    <>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Icon name="flame" size={56} color={st.cur ? c.flame : c.ink3} />
        <Txt v="number" accessibilityRole="header" accessibilityLabel={`${plural(st.cur, 'day')} streak`}>
          {st.cur}
        </Txt>
        <Txt v="bodyBold" tone="ink2">
          day streak
        </Txt>
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1, padding: 14, borderRadius: RADIUS.tile, backgroundColor: c.surface, gap: 4 }}>
          <Txt v="label" tone="ink2">
            Best streak
          </Txt>
          <Txt v="headline">{plural(Math.max(st.best, st.cur), 'day')}</Txt>
        </View>
        <View
          style={{ flex: 1, padding: 14, borderRadius: RADIUS.tile, backgroundColor: c.surface, gap: 4 }}
          accessible
          accessibilityLabel={`${st.tokens} of 2 free misses saved`}
        >
          <Txt v="label" tone="ink2">
            Free misses
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="shield" size={22} color={st.tokens >= 1 ? c.forgiven : c.surface3} />
            <Icon name="shield" size={22} color={st.tokens >= 2 ? c.forgiven : c.surface3} />
            <Txt v="headline" style={{ marginLeft: 4 }}>
              {st.tokens} of 2
            </Txt>
          </View>
        </View>
      </View>
      <Txt v="callout" tone="ink2">
        Followed and Mostly both keep your streak going. Each Monday you get a free miss, and you can save up to two. A missed day uses one
        by itself, so one bad day never breaks a good run.
      </Txt>
      <Button title="Got it" onPress={sheet.close} />
    </>
  );
}

/* ---------- Weekly recap ---------- */

export function RecapSheet({ mon, auto, onClosed }: { mon: DayKey; auto: boolean; onClosed: () => void }) {
  const mark = () => {
    if (auto) store.markRecap(mon);
  };
  return (
    <Sheet label="Weekly recap" onClosed={onClosed} onDismiss={mark}>
      <RecapBody mon={mon} auto={auto} mark={mark} />
    </Sheet>
  );
}

function RecapBody({ mon, auto, mark }: { mon: DayKey; auto: boolean; mark: () => void }) {
  const { c } = useTheme();
  const sheet = useSheet();
  const data = useActive();
  const m = fromKey(mon);
  const wi = weekInfo(data, m);
  const st = streak(data, new Date());
  const ts = slipOf(topSlip(wi.slips));
  const wc = weekWeightChange(data, m);
  const isThis = mon === keyOf(mondayOf(new Date()));
  const title = wi.perfect ? 'Perfect week!' : wi.good >= 5 ? 'Great week!' : wi.good >= 3 ? 'Solid week' : 'Every week counts';
  const note = wi.perfect
    ? 'Seven for seven. Tunas is very proud.'
    : ts
      ? `Next week, plan ahead for ${ts.label.toLowerCase()}.`
      : wi.good >= 5
        ? 'Keep the same rhythm next week.'
        : 'A fresh week starts now. One good day at a time.';
  const tiles: [string, string][] = [
    ['Good days', `${wi.good} of 7`],
    ['Streak now', plural(st.cur, 'day')],
    ['Top slip', ts ? ts.label : 'None'],
    ['Weight', wc == null ? 'Not logged' : `${formatSigned(wc)} kg`],
  ];
  return (
    <>
      <SheetHeader
        art={
          <TunasStill
            stage={stageOf(countGood(data.log))}
            mood={wi.good >= 5 ? 'followed' : wi.good >= 3 ? 'mostly' : 'none'}
            outfit={data.outfit}
            size={120}
          />
        }
        title={title}
        sub={`${isThis ? 'This week so far, ' : ''}${weekRange(m)}`}
      />
      {wi.perfect ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            padding: 12,
            borderRadius: RADIUS.tile,
            backgroundColor: c.followedSoft,
          }}
        >
          <Icon name="flower" size={22} color={c.followedText} />
          <Txt v="calloutBold" color={c.followedText}>
            A flower bloomed in your garden.
          </Txt>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {tiles.map(([k, v]) => (
          <View key={k} style={{ width: '48%', flexGrow: 1, padding: 14, borderRadius: RADIUS.tile, backgroundColor: c.surface, gap: 2 }}>
            <Txt v="label" tone="ink2">
              {k}
            </Txt>
            <Txt v="headline" numberOfLines={1}>
              {v}
            </Txt>
          </View>
        ))}
      </View>
      <Txt v="callout" tone="ink2" center>
        {note}
      </Txt>
      <Button
        title={auto ? 'Start the new week' : 'Done'}
        onPress={() => {
          mark();
          sheet.close();
        }}
      />
    </>
  );
}

/* ---------- A new outfit ---------- */

export function UnlockSheet({ outfit, onClosed }: { outfit: OutfitId; onClosed: () => void }) {
  useEffect(() => {
    store.markOutfitsSeen([outfit]);
  }, [outfit]);
  return (
    <Sheet label="New outfit" onClosed={onClosed}>
      <UnlockBody outfit={outfit} />
    </Sheet>
  );
}

function UnlockBody({ outfit }: { outfit: OutfitId }) {
  const sheet = useSheet();
  const data = useActive();
  const o = OUTFITS.find((x) => x.id === outfit)!;
  const [burst, setBurst] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setBurst(1), 300);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <SheetHeader
        art={<Tunas stage={stageOf(countGood(data.log))} mood="followed" outfit={outfit} size={150} action={{ kind: 'jump', id: 1 }} />}
        title="New outfit!"
        sub={`Tunas earned the ${o.name.toLowerCase()} for reaching ${o.at} good days.`}
      />
      <View style={{ gap: 10 }}>
        <Button
          title="Wear it now"
          onPress={() => {
            store.wear(outfit);
            sheet.close();
            ui.toast(`Tunas is wearing the ${o.name.toLowerCase()}`);
          }}
        />
        <Button kind="quiet" title="Maybe later" onPress={sheet.close} />
      </View>
      <Confetti burst={burst} x={180} y={100} count={50} />
    </>
  );
}
