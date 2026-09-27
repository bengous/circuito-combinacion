import { type MouseEvent, useEffect, useRef } from 'react';
import { es } from '@/i18n/es';
import { IconButton } from '@/shared/ui/IconButton';
import { CloseIcon } from '@/shared/ui/icons';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import styles from './SettingsDialog.module.css';
import { ROLES, type TextSize, type Theme } from './settings';
import { useSettings } from './settingsContext';
import { WireColorPicker } from './WireColorPicker';

interface SettingsDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

const THEMES: readonly Theme[] = ['night', 'day'];
const TEXT_SIZES: readonly TextSize[] = ['normal', 'large', 'huge'];

/** Bottom sheet with every setting. Changes apply immediately. */
export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { settings, update, reset } = useSettings();
  const t = es.settings;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // A tap on the dimmed area around the sheet lands on the <dialog> itself: close it.
  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape already closes a modal <dialog>.
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onClick={onBackdropClick}
      aria-labelledby="settings-title"
    >
      <header className={styles.header}>
        <h2 id="settings-title">{t.title}</h2>
        <IconButton label={t.close} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </header>

      <div className={styles.body}>
        <section className={styles.section}>
          <h3>{t.theme}</h3>
          <SegmentedControl
            label={t.theme}
            options={THEMES.map((value) => ({ value, label: t.themes[value] }))}
            value={settings.theme}
            onChange={(theme) => update({ theme })}
          />
        </section>

        <section className={styles.section}>
          <h3>{t.textSize}</h3>
          <SegmentedControl
            label={t.textSize}
            options={TEXT_SIZES.map((value) => ({ value, label: t.textSizes[value] }))}
            value={settings.textSize}
            onChange={(textSize) => update({ textSize })}
          />
        </section>

        <section className={styles.section}>
          <h3>{t.tension}</h3>
          <SegmentedControl
            label={t.tension}
            options={[
              { value: 'show', label: t.tensionOptions.show },
              { value: 'hide', label: t.tensionOptions.hide },
            ]}
            value={settings.showTension ? 'show' : 'hide'}
            onChange={(choice) => update({ showTension: choice === 'show' })}
          />
        </section>

        <section className={styles.section}>
          <h3>{t.wireColors}</h3>
          {ROLES.map((role) => (
            <WireColorPicker
              key={role}
              role={role}
              value={settings.wireColors[role]}
              onChange={(color) =>
                update({ wireColors: { ...settings.wireColors, [role]: color } })
              }
            />
          ))}
        </section>

        <button type="button" className={styles.reset} onClick={reset}>
          {t.reset}
        </button>
      </div>

      <footer className={styles.footer}>
        <button type="button" className={styles.done} onClick={onClose}>
          {t.done}
        </button>
      </footer>
    </dialog>
  );
}
