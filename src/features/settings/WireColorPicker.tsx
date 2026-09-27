import type { ConductorRole } from '@/domain/circuit';
import { es } from '@/i18n/es';
import { CABLE_COLOR_IDS, CABLE_COLORS, type CableColorId } from './cableColors';
import styles from './SettingsDialog.module.css';

interface WireColorPickerProps {
  readonly role: ConductorRole;
  readonly value: CableColorId;
  readonly onChange: (color: CableColorId) => void;
}

/** One row of colour swatches for a cable role. Native radios keep it keyboard friendly. */
export function WireColorPicker({ role, value, onChange }: WireColorPickerProps) {
  const name = `wire-color-${role}`;
  return (
    <fieldset className={styles.colorRow}>
      <legend className={styles.colorLegend}>{es.settings.roles[role]}</legend>
      <div className={styles.swatches}>
        {CABLE_COLOR_IDS.map((color) => (
          <label key={color} className={styles.swatch} title={es.colors[color]}>
            <input
              type="radio"
              name={name}
              value={color}
              checked={color === value}
              onChange={() => onChange(color)}
              aria-label={es.colors[color]}
            />
            <span style={{ background: CABLE_COLORS[color] }} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
