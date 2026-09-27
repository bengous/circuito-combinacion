import type { KeyboardEvent } from 'react';
import type { Box } from '../geometry/types';
import styles from '../Schematic.module.css';

interface DeviceHitAreaProps {
  readonly area: Box;
  readonly label: string;
  readonly onActivate: () => void;
}

/**
 * Invisible, generous tap target over a switch and its label.
 * SVG has no <button>, so the rect takes the button role and handles the keyboard itself.
 */
export function DeviceHitArea({ area, label, onActivate }: DeviceHitAreaProps) {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onActivate();
    }
  };
  return (
    // biome-ignore lint/a11y/useSemanticElements: <button> cannot be used inside SVG.
    <rect
      className={styles.hit}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onActivate}
      onKeyDown={onKeyDown}
      rx={12}
      {...area}
    />
  );
}
