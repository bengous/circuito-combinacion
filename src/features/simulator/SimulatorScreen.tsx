import { CATALOG, findCircuit } from '@/domain/catalog';
import type { CircuitDefinition } from '@/domain/circuit';
import { useHashValue } from '@/shared/hooks/useHashValue';
import { AppShell } from '@/shared/ui/AppShell';
import { StageLayout, StageRegion } from '@/shared/ui/StageLayout';
import { AppHeader } from './AppHeader';
import { CircuitPicker } from './CircuitPicker';
import { CircuitSimulator } from './CircuitSimulator';

const DEFAULT_CIRCUIT = CATALOG[0] as CircuitDefinition;

/**
 * The main screen. The selected circuit lives in the URL hash.
 * The picker stays outside the remounted simulator, so it keeps focus when used.
 */
export function SimulatorScreen() {
  const [circuitId, setCircuitId] = useHashValue();
  const circuit = findCircuit(circuitId) ?? DEFAULT_CIRCUIT;

  return (
    <AppShell>
      <AppHeader />
      <StageLayout as="main">
        <StageRegion area="toolbar">
          <CircuitPicker circuits={CATALOG} selected={circuit} onSelect={setCircuitId} />
        </StageRegion>
        <CircuitSimulator key={circuit.id} circuit={circuit} />
      </StageLayout>
    </AppShell>
  );
}
