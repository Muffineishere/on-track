import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Platform, TextInput, View } from 'react-native';

import { Sheet, useSheet } from '@/components/Sheet';
import { Button, Txt } from '@/components/ui';
import { backupText, checkBackup, type BackupCheck } from '@/domain/backup';
import { keyOf } from '@/domain/dates';
import { useDataStore, store } from '@/store/data';
import { ui } from '@/store/ui';
import { FONT, RADIUS, useTheme } from '@/theme';

import { SheetHeader } from './common';

export function BackupSheet({ onClosed }: { onClosed: () => void }) {
  return (
    <Sheet label="Backup and restore" onClosed={onClosed}>
      <BackupBody />
    </Sheet>
  );
}

const fileName = () => `on-track-backup-${keyOf(new Date())}.json`;

async function readPicked(asset: DocumentPicker.DocumentPickerAsset) {
  if (Platform.OS === 'web') {
    if (asset.file) return await asset.file.text();
    return await (await fetch(asset.uri)).text();
  }
  return await new File(asset.uri).text();
}

/**
 * Backups are plain JSON: copy them, save them as a file, and restore by picking the
 * file or pasting the text. Backups from the On Track web prototype restore too.
 */
function BackupBody() {
  const { c } = useTheme();
  const sheet = useSheet();
  const own = useDataStore((s) => s.data);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [pasted, setPasted] = useState('');
  const [check, setCheck] = useState<BackupCheck | null>(null);

  const copy = async () => {
    try {
      await Clipboard.setStringAsync(backupText(own, new Date()));
      setMsg({ text: 'Backup copied. Paste it into a note or an email to yourself.', ok: true });
    } catch {
      setMsg({ text: 'Copying didn’t work here. Try saving a file instead.', ok: false });
    }
  };

  const save = async () => {
    const text = backupText(own, new Date());
    try {
      if (Platform.OS === 'web') {
        const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName();
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        setMsg({ text: 'Backup file saved to your downloads.', ok: true });
        return;
      }
      const file = new File(Paths.cache, fileName());
      if (file.exists) file.delete();
      file.create();
      await file.write(text);
      await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Save your On Track backup', UTI: 'public.json' });
      setMsg({ text: 'Choose Save to Files, or send it to yourself.', ok: true });
    } catch {
      setMsg({ text: 'That didn’t work here. Use Copy instead.', ok: false });
    }
  };

  const pick = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true });
      if (res.canceled || !res.assets?.length) return;
      const text = await readPicked(res.assets[0]);
      setPasted('');
      setCheck(checkBackup(text, new Date()));
    } catch {
      setCheck({ ok: false, message: 'That file couldn’t be read.' });
    }
  };

  const restore = () => {
    if (!check?.ok) return;
    const prev = structuredClone(own);
    store.replaceAll(check.data);
    sheet.close();
    ui.toast('Backup restored', () => store.replaceAll(prev));
  };

  return (
    <>
      <SheetHeader
        title="Backup and restore"
        sub="Your data lives on this device. Keep a copy somewhere safe, or move it to a new phone."
      />
      <View style={{ gap: 10 }}>
        <Button icon="share" title={Platform.OS === 'web' ? 'Download a backup file' : 'Save a backup file'} onPress={save} />
        <Button kind="secondary" icon="copy" title="Copy backup as text" onPress={copy} />
        {msg ? (
          <Txt v="callout" color={msg.ok ? c.followedText : c.danger} center accessibilityLiveRegion="polite">
            {msg.text}
          </Txt>
        ) : null}
      </View>

      <View style={{ height: 1, backgroundColor: c.line }} />

      <View style={{ gap: 10 }}>
        <Txt v="headline">Restore</Txt>
        <Button kind="secondary" icon="file" title="Choose a backup file" onPress={pick} />
        <Txt v="calloutBold" tone="ink2">
          Or paste backup text
        </Txt>
        <TextInput
          value={pasted}
          onChangeText={(t) => {
            setPasted(t);
            setCheck(checkBackup(t, new Date()));
          }}
          multiline
          placeholder="The whole backup, from { to }"
          placeholderTextColor={c.ink3}
          accessibilityLabel="Backup text to restore"
          style={{
            minHeight: 84,
            maxHeight: 160,
            padding: 14,
            borderRadius: RADIUS.control,
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: c.line,
            color: c.ink,
            fontFamily: FONT.semibold,
            fontSize: 14,
            textAlignVertical: 'top',
          }}
        />
        {check ? (
          <Txt v="callout" color={check.ok ? c.followedText : c.danger} accessibilityLiveRegion="polite">
            {check.ok ? check.summary : check.message}
          </Txt>
        ) : null}
        <Button kind="danger" title="Restore this backup" disabled={!check?.ok} onPress={restore} />
      </View>
    </>
  );
}
