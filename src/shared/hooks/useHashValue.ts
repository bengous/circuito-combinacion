import { useCallback, useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

/**
 * The value of a URL hash, without the '#'. Never throws: a broken link (e.g. a cut
 * "%E0%A4%A") gives the raw text back instead of blanking the page.
 */
export function decodeHash(hash: string): string {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

const readHash = () => decodeHash(window.location.hash);

/** The URL hash (`#combinacion-simple`) as state, so a screen can be bookmarked or shared. */
export function useHashValue(): [string, (value: string) => void] {
  const value = useSyncExternalStore(subscribe, readHash, () => '');
  const setValue = useCallback((next: string) => {
    window.location.hash = encodeURIComponent(next);
  }, []);
  return [value, setValue];
}
