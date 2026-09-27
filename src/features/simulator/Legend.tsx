import { ROLES } from '@/features/settings/settings';
import { useSettings } from '@/features/settings/settingsContext';
import { es } from '@/i18n/es';
import styles from './Legend.module.css';

/** Explains the colours on screen, with the switch to show or hide live cables. */
export function Legend() {
  const { settings, update } = useSettings();
  const { showTension } = settings;

  return (
    <div className={styles.legend}>
      <ul className={styles.items}>
        {showTension ? (
          <>
            <li>
              <span className={styles.swatch} data-tone="phase" />
              {es.legend.live}
            </li>
            <li>
              <span className={styles.swatch} data-tone="phase" data-flowing="true" />
              {es.legend.current}
            </li>
          </>
        ) : (
          ROLES.map((role) => (
            <li key={role}>
              <span className={styles.swatch} data-tone={role} />
              {es.settings.roles[role]}
            </li>
          ))
        )}
      </ul>
      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={showTension}
          onChange={(event) => update({ showTension: event.target.checked })}
        />
        {es.legend.showTension}
      </label>
    </div>
  );
}
