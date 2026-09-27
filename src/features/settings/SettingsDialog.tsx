import { es } from '@/i18n/es';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import styles from './SettingsDialog.module.css';
import { ROLES, type TextSize } from './settings';
import { useSettings } from './settingsContext';
import { THEMES } from './theme';
import { WireColorPicker } from './WireColorPicker';

interface SettingsDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

const TEXT_SIZES: readonly TextSize[] = ['normal', 'large', 'huge'];

/** Every setting in one sheet. Changes apply immediately. */
export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { settings, update, reset } = useSettings();
  const t = es.settings;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t.title}
      closeLabel={t.close}
      footer={
        <Button variant="primary" block onClick={onClose}>
          {t.done}
        </Button>
      }
    >
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
            theme={settings.theme}
            value={settings.wireColors[role]}
            onChange={(color) => update({ wireColors: { ...settings.wireColors, [role]: color } })}
          />
        ))}
      </section>

      <Button variant="outline" block className={styles.reset} onClick={reset}>
        {t.reset}
      </Button>
    </Dialog>
  );
}
