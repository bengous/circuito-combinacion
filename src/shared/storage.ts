/**
 * localStorage can be missing or throw (private browsing, blocked site data).
 * These helpers never throw: the app keeps working, it just forgets on reload.
 */
export function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the value only lasts for this visit.
  }
}
