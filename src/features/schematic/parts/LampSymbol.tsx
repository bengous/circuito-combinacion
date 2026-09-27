import { useId } from 'react';
import { es } from '@/i18n/es';
import type { SchematicGeometry } from '../geometry/types';
import styles from '../Schematic.module.css';

interface LampSymbolProps {
  readonly lamp: SchematicGeometry['lamp'];
  readonly on: boolean;
}

/** Lamp drawn as the usual schematic symbol: a circle with a cross. Glows when on. */
export function LampSymbol({ lamp, on }: LampSymbolProps) {
  const glowId = useId();
  const { center, radius } = lamp;
  const arm = radius * 0.55;
  return (
    <g className={styles.lamp} data-on={on} transform={`translate(${center.x} ${center.y})`}>
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0" stopColor="var(--lamp)" stopOpacity={0.75} />
          <stop offset="0.55" stopColor="var(--lamp)" stopOpacity={0.22} />
          <stop offset="1" stopColor="var(--lamp)" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle className={styles.lampGlow} r={radius * 2.8} fill={`url(#${glowId})`} />
      <circle className={styles.lampGlass} r={radius} />
      <path
        className={styles.lampCross}
        d={`M${-arm},${-arm} L${arm},${arm} M${-arm},${arm} L${arm},${-arm}`}
      />
      <title>{es.schematic.lamp}</title>
    </g>
  );
}
