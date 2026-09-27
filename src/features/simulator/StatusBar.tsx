import { es } from '@/i18n/es';
import styles from './SimulatorScreen.module.css';

interface StatusBarProps {
  readonly lampOn: boolean;
  readonly demoRunning: boolean;
  readonly onReset: () => void;
  readonly onToggleDemo: () => void;
}

/** Lamp state and the main actions, within thumb reach at the bottom of the screen. */
export function StatusBar({ lampOn, demoRunning, onReset, onToggleDemo }: StatusBarProps) {
  return (
    <div className={styles.statusBar}>
      <output className={styles.lampStatus} data-on={lampOn}>
        <span className={styles.lampDot} aria-hidden="true" />
        {lampOn ? es.status.lampOn : es.status.lampOff}
      </output>
      <button type="button" className={styles.action} onClick={onReset}>
        {es.status.reset}
      </button>
      <button
        type="button"
        className={styles.action}
        aria-pressed={demoRunning}
        onClick={onToggleDemo}
      >
        {demoRunning ? es.status.stopDemo : es.status.demo}
      </button>
    </div>
  );
}
