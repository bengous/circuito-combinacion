import type { ReactNode } from 'react';
import styles from './IconButton.module.css';

interface IconButtonProps {
  /** Accessible name, also shown as a tooltip. */
  readonly label: string;
  readonly onClick: () => void;
  readonly children: ReactNode;
}

export function IconButton({ label, onClick, children }: IconButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
