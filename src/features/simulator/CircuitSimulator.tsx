import { useCallback } from 'react';
import type { CircuitDefinition } from '@/domain/circuit';
import { Schematic } from '@/features/schematic/Schematic';
import { useSettings } from '@/features/settings/settingsContext';
import { StageRegion } from '@/shared/ui/StageLayout';
import styles from './CircuitSimulator.module.css';
import { Legend } from './Legend';
import { MessagePanel } from './MessagePanel';
import { describe } from './message';
import { StatusBar } from './StatusBar';
import { useDemo } from './useDemo';
import { useSimulator } from './useSimulator';

/**
 * One circuit, live: schematic, explanation and controls. Remount it to start fresh.
 * Renders the summary, stage and panel regions of the surrounding StageLayout.
 */
export function CircuitSimulator({ circuit }: { readonly circuit: CircuitDefinition }) {
  const { settings } = useSettings();
  const sim = useSimulator(circuit);
  const demo = useDemo(circuit, sim.show);
  const { setRunning } = demo;

  const onToggle = useCallback(
    (deviceId: string) => {
      setRunning(false);
      sim.toggle(deviceId);
    },
    [setRunning, sim.toggle],
  );
  const onReset = useCallback(() => {
    setRunning(false);
    sim.reset();
  }, [setRunning, sim.reset]);

  const lampOn = sim.state.lampsOn.size > 0;
  const message = describe(
    circuit,
    sim.positions,
    sim.diagnosis,
    sim.lastMoved,
    settings.showTension,
  );

  return (
    <>
      <StageRegion area="summary">
        <p className={styles.circuitTitle}>
          <strong>{circuit.title}</strong>
        </p>
        <Legend />
      </StageRegion>
      <StageRegion area="stage">
        <Schematic
          circuit={circuit}
          positions={sim.positions}
          state={sim.state}
          showTension={settings.showTension}
          highlightedDevice={sim.lastMoved}
          onToggle={onToggle}
        />
      </StageRegion>
      <StageRegion area="panel">
        <MessagePanel message={message} />
        <StatusBar
          lampOn={lampOn}
          demoRunning={demo.running}
          onReset={onReset}
          onToggleDemo={() => setRunning((running) => !running)}
        />
      </StageRegion>
    </>
  );
}
