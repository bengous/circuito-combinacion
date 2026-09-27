import type { SchematicGeometry } from '../geometry/types';
import styles from '../Schematic.module.css';

/** Phase and neutral feed points. */
export function Sources({ sources }: { readonly sources: SchematicGeometry['sources'] }) {
  return (
    <g>
      <circle
        className={styles.source}
        data-tone="phase"
        cx={sources.phase.at.x}
        cy={sources.phase.at.y}
        r={8}
      />
      <circle
        className={styles.source}
        data-tone="neutral"
        cx={sources.neutral.at.x}
        cy={sources.neutral.at.y}
        r={8}
      />
    </g>
  );
}
