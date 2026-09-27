import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { applySettings, loadSettings, saveSettings } from './persistence';
import { DEFAULT_SETTINGS, type Settings } from './settings';
import { SettingsContext } from './settingsContext';

/** Holds the user's settings, saves them on the device and applies them to the page. */
export function SettingsProvider({ children }: { readonly children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    applySettings(settings);
    saveSettings(settings);
  }, [settings]);

  const value = useMemo(
    () => ({
      settings,
      update: (patch: Partial<Settings>) => setSettings((current) => ({ ...current, ...patch })),
      reset: () => setSettings(DEFAULT_SETTINGS),
    }),
    [settings],
  );

  return <SettingsContext value={value}>{children}</SettingsContext>;
}
