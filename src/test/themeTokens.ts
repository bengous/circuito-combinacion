import type { Theme } from '@/features/settings/theme';
import tokensCss from '@/styles/tokens.css?raw';

type Tokens = Readonly<Record<string, string>>;

/** Custom properties declared in the first rule whose selector list contains `selector`. */
function block(selector: string): Tokens {
  const rule = new RegExp(
    `(^|[,\\s])${selector.replace(/[[\]"]/g, '\\$&')}[^{]*\\{([^}]*)\\}`,
    'm',
  );
  const body = rule.exec(tokensCss)?.[2];
  if (body === undefined) throw new Error(`No rule for ${selector} in tokens.css`);
  return Object.fromEntries(
    [...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      value?.trim(),
    ]),
  );
}

/**
 * The tokens as the browser sees them in a theme, read from tokens.css itself so tests
 * check the real values. The night block also matches a bare `:root`, so it is the base
 * that the day block overrides.
 */
export function themeTokens(theme: Theme): Tokens {
  return {
    ...block(':root'),
    ...block(':root[data-theme="night"]'),
    ...(theme === 'night' ? {} : block(`:root[data-theme="${theme}"]`)),
  };
}

/** One token, failing loudly when it is missing. */
export function token(tokens: Tokens, name: string): string {
  const value = tokens[name];
  if (value === undefined) throw new Error(`Missing token ${name}`);
  return value;
}
