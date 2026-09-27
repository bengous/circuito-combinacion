import { SettingsProvider } from '@/features/settings/SettingsProvider';
import { SimulatorScreen } from '@/features/simulator/SimulatorScreen';

export function App() {
  return (
    <SettingsProvider>
      <SimulatorScreen />
    </SettingsProvider>
  );
}
