import type { ReactNode } from 'react';
import styles from './VisuallyHidden.module.css';

interface VisuallyHiddenProps {
  /** `legend` names a <fieldset>; it must then be the fieldset's first child. */
  readonly as?: 'span' | 'legend';
  readonly children: ReactNode;
}

/** Text for screen readers only: invisible, but still read out and still in the layout tree. */
export function VisuallyHidden({ as: Element = 'span', children }: VisuallyHiddenProps) {
  return <Element className={styles.hidden}>{children}</Element>;
}
