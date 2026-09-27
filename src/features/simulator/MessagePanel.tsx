import styles from './MessagePanel.module.css';
import type { Message } from './message';

interface MessagePanelProps {
  readonly message: Message;
  /** Stop announcing changes, e.g. while the demo changes the circuit every 1.5 s. */
  readonly quiet: boolean;
}

/**
 * Plain-language explanation of what the schematic shows. Screen readers read it out
 * whole (aria-atomic) when it changes, unless `quiet`.
 */
export function MessagePanel({ message, quiet }: MessagePanelProps) {
  return (
    <p className={styles.message} aria-live={quiet ? 'off' : 'polite'} aria-atomic="true">
      {message.moved && <strong>{message.moved} </strong>}
      {message.explanation}
      {message.warning && <span className={styles.warning}> {message.warning}</span>}
    </p>
  );
}
