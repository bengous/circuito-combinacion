import type { Point } from '../geometry/types';
import styles from '../Schematic.module.css';
import type { WireStyle } from '../wireStyle';

interface WireLineProps {
  /** Either a polyline through `points`, or a ready-made SVG path. */
  readonly points?: readonly Point[];
  readonly d?: string;
  readonly look: WireStyle;
}

function toPath(points: readonly Point[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
}

export function WireLine({ points = [], d, look }: WireLineProps) {
  return (
    <path
      className={styles.wire}
      d={d ?? toPath(points)}
      data-tone={look.tone}
      data-flowing={look.flowing}
      data-strong={look.strong}
    />
  );
}
