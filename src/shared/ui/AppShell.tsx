import type { ReactNode } from 'react';
import styles from './AppShell.module.css';

/**
 * Page frame: a header row, then the content filling the rest of the screen.
 * Children: the header first, then the content (a modal dialog may sit in between:
 * closed it takes no room, open it lives in the top layer).
 */
export function AppShell({ children }: { readonly children: ReactNode }) {
  return <div className={styles.shell}>{children}</div>;
}
