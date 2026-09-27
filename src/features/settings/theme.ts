/** Colour themes. Their tokens live in `styles/tokens.css` under `[data-theme]`. */
export type Theme = 'night' | 'day';

export const THEMES: readonly Theme[] = ['night', 'day'];

/** A colour that has one value per theme, for colours chosen in TypeScript. */
export type ThemedColor = Readonly<Record<Theme, string>>;
