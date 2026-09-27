import type { ReactNode } from 'react';
import styles from './StageLayout.module.css';

/**
 * - toolbar: controls that change what the stage shows (e.g. a picker);
 * - summary: what is on stage (title, legend);
 * - stage: the main visual, which grows to fill the screen (its content sets a floor);
 * - panel: explanation and actions.
 */
export type StageArea = 'toolbar' | 'summary' | 'stage' | 'panel';

interface StageLayoutProps {
  /** Use `main` when the layout is the page's main content. */
  readonly as?: 'div' | 'main';
  /** `StageRegion`s, directly or through fragments. Each area at most once. */
  readonly children: ReactNode;
}

/**
 * Responsive layout around one big visual (see StageLayout.module.css for the rules):
 * portrait phones stack the areas, landscape phones and wide screens put the stage on
 * the left and the other areas in a side column.
 */
export function StageLayout({ as: Element = 'div', children }: StageLayoutProps) {
  return <Element className={styles.layout}>{children}</Element>;
}

/**
 * One area of a StageLayout. Regions can be rendered by different components (e.g. a
 * remounted child returning a fragment of regions), since placement is done by the grid.
 */
export function StageRegion(props: { readonly area: StageArea; readonly children: ReactNode }) {
  const { area, children } = props;
  return <div className={styles[area]}>{children}</div>;
}
