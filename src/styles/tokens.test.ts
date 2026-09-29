import { THEMES } from '@/features/settings/theme';
import { blend, contrastRatio } from '@/test/contrast';
import { themeTokens, token } from '@/test/themeTokens';

const TEXT = 4.5;
const GRAPHICS = 3;

describe.each(THEMES)('%s theme tokens', (theme) => {
  const tokens = themeTokens(theme);
  const t = (name: string) => token(tokens, name);
  const ratio = (a: string, b: string) => contrastRatio(t(a), t(b));

  it.each([
    ['--ink', '--bg'],
    ['--ink', '--panel'],
    ['--muted', '--bg'],
    ['--muted', '--panel'],
    ['--muted', '--device-body'],
    ['--danger', '--panel'],
    ['--accent-ink', '--accent'],
  ])('text %s on %s is readable', (text, background) => {
    expect(ratio(text, background)).toBeGreaterThanOrEqual(TEXT);
  });

  it.each([
    ['--focus', '--bg'],
    ['--device-stroke', '--bg'],
    ['--terminal', '--device-body'],
    ['--arm', '--device-body'],
    ['--accent', '--device-body'],
    ['--lamp-ring', '--device-body'],
    ['--lamp-ring', '--bg'],
    ['--control-border', '--bg'],
    ['--control-border', '--panel'],
    ['--lamp-filament', '--lamp-core'],
  ])('graphic %s on %s is visible', (graphic, background) => {
    expect(ratio(graphic, background)).toBeGreaterThanOrEqual(GRAPHICS);
  });

  it('keeps dead cables visible, even faded', () => {
    const opacity = Number(t('--wire-faded-opacity'));
    const background = t('--bg');
    expect(
      contrastRatio(blend(t('--wire-dead'), background, opacity), background),
    ).toBeGreaterThanOrEqual(GRAPHICS);
  });
});
