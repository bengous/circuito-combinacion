import { blend, contrastRatio } from '@/test/contrast';
import { themeTokens, token } from '@/test/themeTokens';
import { CABLE_COLOR_IDS, cableColor } from './cableColors';
import { THEMES } from './theme';

const GRAPHICS = 3;

describe.each(THEMES)('cable colours in the %s theme', (theme) => {
  const tokens = themeTokens(theme);
  const background = token(tokens, '--bg');
  const switchBody = token(tokens, '--device-body');
  const faded = Number(token(tokens, '--wire-faded-opacity'));

  it.each(CABLE_COLOR_IDS)('%s stands out on the page and inside a switch', (id) => {
    const color = cableColor(id, theme);
    expect(contrastRatio(color, background)).toBeGreaterThanOrEqual(GRAPHICS);
    expect(contrastRatio(color, switchBody)).toBeGreaterThanOrEqual(GRAPHICS);
  });

  it.each(CABLE_COLOR_IDS)('%s stays visible on the page when faded (idle cable)', (id) => {
    const seen = blend(cableColor(id, theme), background, faded);
    expect(contrastRatio(seen, background)).toBeGreaterThanOrEqual(GRAPHICS);
  });
});
