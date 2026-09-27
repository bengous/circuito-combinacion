import { readJson, writeJson } from '@/shared/storage';
import { CABLE_COLORS } from './cableColors';
import { parseSettings, ROLES, type Settings, TEXT_SCALE } from './settings';

const STORAGE_KEY = 'circuito.settings.v1';

export function loadSettings(): Settings {
  return parseSettings(readJson(STORAGE_KEY));
}

export function saveSettings(settings: Settings): void {
  writeJson(STORAGE_KEY, settings);
}

/** Pushes settings to the page: theme attribute and CSS variables read by the styles. */
export function applySettings(settings: Settings, root: HTMLElement = document.documentElement) {
  root.dataset.theme = settings.theme;
  root.style.setProperty('--text-scale', String(TEXT_SCALE[settings.textSize]));
  for (const role of ROLES) {
    root.style.setProperty(`--wire-${role}`, CABLE_COLORS[settings.wireColors[role]]);
  }
}
