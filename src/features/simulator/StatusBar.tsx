import { es } from '@/i18n/es';
import { Button } from '@/shared/ui/Button';
import styles from './StatusBar.module.css';

interface StatusBarProps {
  readonly lampOn: boolean;
  readonly demoRunning: boolean;
  readonly onReset: () => void;
  readonly onToggleDemo: () => void;
}

/**
 * Lamp state and the main actions, within thumb reach at the bottom of the screen.
 * The lamp state is a live region (<output>), silenced while the demo runs.
 */
export function StatusBar({ lampOn, demoRunning, onReset, onToggleDemo }: StatusBarProps) {
  return (
    <div className={styles.statusBar}>
      <output
        className={styles.lampStatus}
        data-on={lampOn}
        aria-live={demoRunning ? 'off' : 'polite'}
      >
        <span className={styles.lampDot} aria-hidden="true" />
        {lampOn ? es.status.lampOn : es.status.lampOff}
      </output>
      <Button className={styles.action} onClick={onReset}>
        {es.status.reset}
      </Button>
      <Button className={styles.action} active={demoRunning} onClick={onToggleDemo}>
        {demoRunning ? es.status.stopDemo : es.status.demo}
      </Button>
    </div>
  );
}
