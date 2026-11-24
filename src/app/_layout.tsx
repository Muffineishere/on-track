import { Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black, useFonts } from '@expo-google-fonts/nunito';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppTabs from '@/components/AppTabs';
import { ToastView } from '@/components/Toast';
import { syncReminders } from '@/lib/reminders';
import { updateWidgets } from '@/widgets/sync';
import { Onboarding } from '@/sheets/Onboarding';
import { SheetHost } from '@/sheets/SheetHost';
import { useDataStore } from '@/store/data';
import { maybeRecap } from '@/store/flows';
import { ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black });
  const hydrated = useDataStore((s) => s.hydrated);
  const pref = useDataStore((s) => s.data.theme);
  const ready = (fontsLoaded || !!fontError) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider pref={pref}>
          <Shell />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Shell() {
  const { c, dark } = useTheme();
  const data = useDataStore((s) => s.data);
  const demo = useDataStore((s) => s.demo !== null);

  // Keep the next two weeks of reminders in step with the user's answers and settings.
  useEffect(() => {
    const timer = setTimeout(() => {
      syncReminders(data, new Date());
      updateWidgets(data);
    }, 600);
    return () => clearTimeout(timer);
  }, [data]);

  // The weekly recap opens by itself once per week, on launch or on return to the app.
  useEffect(() => {
    if (data.onboarded) maybeRecap(new Date());
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') return;
      // A home screen widget may have logged a day while the app was in the background.
      useDataStore.persist.rehydrate().then(() => maybeRecap(new Date()));
    });
    return () => sub.remove();
  }, [data.onboarded]);

  const nav = dark ? DarkTheme : DefaultTheme;
  return (
    <NavThemeProvider
      value={{ ...nav, colors: { ...nav.colors, background: c.bg, card: c.surface, primary: c.brandText, text: c.ink, border: c.line } }}
    >
      <StatusBar style={dark ? 'light' : 'dark'} />
      <AppTabs />
      <SheetHost />
      <ToastView hideUnderSheet />
      {!data.onboarded && !demo ? <Onboarding /> : null}
    </NavThemeProvider>
  );
}
