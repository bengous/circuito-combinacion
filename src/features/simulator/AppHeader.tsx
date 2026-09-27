import { useState } from 'react';
import { SettingsDialog } from '@/features/settings/SettingsDialog';
import { useSettings } from '@/features/settings/settingsContext';
import { es } from '@/i18n/es';
import { IconButton } from '@/shared/ui/IconButton';
import { MoonIcon, SettingsIcon, SunIcon } from '@/shared/ui/icons';
import styles from './AppHeader.module.css';

/**
 * App title, quick theme switch and settings. The settings dialog is rendered next to
 * the <header>, not inside it: a modal is its own layer, not part of the banner landmark.
 */
export function AppHeader() {
  const { settings, update } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const nextTheme = settings.theme === 'night' ? 'day' : 'night';

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>{es.appName}</h1>
        <div className={styles.actions}>
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
      </header>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
