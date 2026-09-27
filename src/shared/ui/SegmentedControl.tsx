import type { ReactNode } from 'react';
import styles from './SegmentedControl.module.css';
import { VisuallyHidden } from './VisuallyHidden';

export interface SegmentOption<T extends string> {
  readonly value: T;
  readonly label: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  /** Accessible name of the group. */
  readonly label: string;
  readonly options: readonly SegmentOption<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
}

/** A row of mutually exclusive buttons, large enough for a thumb. A named group. */
export function SegmentedControl<T extends string>(props: SegmentedControlProps<T>) {
  const { label, options, value, onChange } = props;
  return (
    <fieldset className={styles.group}>
      <VisuallyHidden as="legend">{label}</VisuallyHidden>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.option}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  );
}
