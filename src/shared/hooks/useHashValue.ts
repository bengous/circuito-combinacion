import { useCallback, useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

const readHash = () => decodeURIComponent(window.location.hash.slice(1));

/** The URL hash (`#combinacion-simple`) as state, so a screen can be bookmarked or shared. */
export function useHashValue(): [string, (value: string) => void] {
  const value = useSyncExternalStore(subscribe, readHash, () => '');
  const setValue = useCallback((next: string) => {
    window.location.hash = encodeURIComponent(next);
  }, []);
  return [value, setValue];
}
