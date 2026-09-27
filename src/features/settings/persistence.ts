import { readJson, writeJson } from '@/shared/storage';
import { cableColor } from './cableColors';
import { parseSettings, ROLES, type Settings, TEXT_SCALE } from './settings';

const STORAGE_KEY = 'circuito.settings.v1';

export function loadSettings(): Settings {
  return parseSettings(readJson(STORAGE_KEY));
}

export function saveSettings(settings: Settings): void {
  writeJson(STORAGE_KEY, settings);
}

/**
 * The browser's own bars (iOS Safari, Android Chrome) follow the page background.
 * The colour is read from the theme's --bg token, so tokens.css stays the only source.
 */
function syncThemeColor(root: HTMLElement) {
  const meta = root.ownerDocument.querySelector('meta[name="theme-color"]');
  const background = getComputedStyle(root).getPropertyValue('--bg').trim();
  if (meta && background) meta.setAttribute('content', background);
}

/** Pushes settings to the page: theme attribute and CSS variables read by the styles. */
export function applySettings(settings: Settings, root: HTMLElement = document.documentElement) {
  root.dataset.theme = settings.theme;
  syncThemeColor(root);
  root.style.setProperty('--text-scale', String(TEXT_SCALE[settings.textSize]));
  for (const role of ROLES) {
    root.style.setProperty(`--wire-${role}`, cableColor(settings.wireColors[role], settings.theme));
  }
}
