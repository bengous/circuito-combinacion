import { SettingsProvider } from '@/features/settings/SettingsProvider';
import { SimulatorScreen } from '@/features/simulator/SimulatorScreen';
import { ErrorBoundary } from './ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <SimulatorScreen />
      </SettingsProvider>
    </ErrorBoundary>
  );
}
