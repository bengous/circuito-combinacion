import { CATALOG, findCircuit } from '@/domain/catalog';
import type { CircuitDefinition } from '@/domain/circuit';
import { useHashValue } from '@/shared/hooks/useHashValue';
import { AppHeader } from './AppHeader';
import { CircuitPicker } from './CircuitPicker';
import { CircuitSimulator } from './CircuitSimulator';
import styles from './SimulatorScreen.module.css';

const DEFAULT_CIRCUIT = CATALOG[0] as CircuitDefinition;

/** The main screen. The selected circuit lives in the URL hash. */
export function SimulatorScreen() {
  const [circuitId, setCircuitId] = useHashValue();
  const circuit = findCircuit(circuitId) ?? DEFAULT_CIRCUIT;

  return (
    <div className={styles.screen}>
      <AppHeader />
      <nav className={styles.picker}>
        <CircuitPicker circuits={CATALOG} selected={circuit} onSelect={setCircuitId} />
      </nav>
      <CircuitSimulator key={circuit.id} circuit={circuit} />
    </div>
  );
}
