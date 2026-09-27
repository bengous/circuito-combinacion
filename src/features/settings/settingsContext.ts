import { createContext, useContext } from 'react';
import type { Settings } from './settings';

export interface SettingsContextValue {
  readonly settings: Settings;
  readonly update: (patch: Partial<Settings>) => void;
  readonly reset: () => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside <SettingsProvider>');
  return value;
}
