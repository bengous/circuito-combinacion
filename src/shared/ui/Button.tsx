import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** primary: filled accent; secondary: panel colour; outline: transparent with a border. */
  readonly variant?: ButtonVariant;
  /**
   * Draws the button as "switched on" (e.g. while the demo runs). Purely visual: when the
   * label already changes with the state, adding aria-pressed would say it twice.
   */
  readonly active?: boolean;
  /** Takes the full width of its container. */
  readonly block?: boolean;
}

/** Text button with a thumb-sized tap target. `className` is for layout only (flex, grid). */
export function Button(props: ButtonProps) {
  const { variant = 'secondary', active = false, block = false, className, ...rest } = props;
  return (
    <button
      type="button"
      className={className ? `${styles.button} ${className}` : styles.button}
      data-variant={variant}
      data-active={active}
      data-block={block}
      {...rest}
    />
  );
}
