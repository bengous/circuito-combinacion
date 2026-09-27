import type { Message } from './message';
import styles from './SimulatorScreen.module.css';

/** Plain-language explanation of what the schematic shows. Read out by screen readers. */
export function MessagePanel({ message }: { readonly message: Message }) {
  return (
    <p className={styles.message} aria-live="polite">
      {message.moved && <strong>{message.moved} </strong>}
      {message.explanation}
      {message.warning && <span className={styles.warning}> {message.warning}</span>}
    </p>
  );
}
