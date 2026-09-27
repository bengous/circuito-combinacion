import { applySettings, loadSettings, saveSettings } from './persistence';
import { DEFAULT_SETTINGS, parseSettings } from './settings';

describe('parseSettings', () => {
  it('returns the defaults for missing or broken data', () => {
    expect(parseSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('garbage')).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps valid fields and repairs invalid ones', () => {
    const parsed = parseSettings({
      theme: 'day',
      textSize: 'enormous',
      showTension: false,
      wireColors: { phase: 'marron', neutral: 'fucsia' },
    });
    expect(parsed).toEqual({
      theme: 'day',
      textSize: 'normal',
      showTension: false,
      wireColors: { ...DEFAULT_SETTINGS.wireColors, phase: 'marron' },
    });
  });
});

describe('persistence', () => {
  it('round-trips through localStorage', () => {
    const settings = { ...DEFAULT_SETTINGS, theme: 'day' as const };
    saveSettings(settings);
    expect(loadSettings()).toEqual(settings);
  });

  it('applies theme, text scale and cable colours to the page', () => {
    const root = document.createElement('div');
    applySettings({ ...DEFAULT_SETTINGS, textSize: 'huge' }, root);
    expect(root.dataset.theme).toBe('night');
    expect(root.style.getPropertyValue('--text-scale')).toBe('1.3');
    expect(root.style.getPropertyValue('--wire-phase')).toBe('#E53935');
  });
});
