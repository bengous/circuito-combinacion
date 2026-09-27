import { useState } from 'react';
import { SettingsDialog } from '@/features/settings/SettingsDialog';
import { useSettings } from '@/features/settings/settingsContext';
import { es } from '@/i18n/es';
import { IconButton } from '@/shared/ui/IconButton';
import { MoonIcon, SettingsIcon, SunIcon } from '@/shared/ui/icons';
import styles from './SimulatorScreen.module.css';

/** App title, quick theme switch and settings. */
export function AppHeader() {
  const { settings, update } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const nextTheme = settings.theme === 'night' ? 'day' : 'night';

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{es.appName}</h1>
      <div className={styles.headerActions}>
        <IconButton
          label={es.settings.toggleTheme(es.settings.themes[nextTheme])}
          onClick={() => update({ theme: nextTheme })}
        >
          {settings.theme === 'night' ? <SunIcon /> : <MoonIcon />}
        </IconButton>
        <IconButton label={es.settings.open} onClick={() => setSettingsOpen(true)}>
          <SettingsIcon />
        </IconButton>
      </div>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
