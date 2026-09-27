import { type MouseEvent, type ReactNode, useEffect, useId, useRef } from 'react';
import styles from './Dialog.module.css';
import { IconButton } from './IconButton';
import { CloseIcon } from './icons';

interface DialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  /** Accessible name of the close button in the corner. */
  readonly closeLabel: string;
  /** Stays visible below the scrolling content, e.g. a "Done" button. */
  readonly footer?: ReactNode;
  readonly children: ReactNode;
}

/**
 * Modal sheet on the native <dialog>: focus trap, Escape and the top layer come for free.
 * Closes on Escape, on the corner button and on a tap on the dimmed area around it.
 * Render it outside landmarks such as <header>: it is a separate layer of the page.
 */
export function Dialog({ open, onClose, title, closeLabel, footer, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // A tap on the dimmed area around the sheet lands on the <dialog> itself: close it.
  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape already closes a modal <dialog>.
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onClick={onBackdropClick}
      aria-labelledby={titleId}
    >
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <IconButton label={closeLabel} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </dialog>
  );
}
