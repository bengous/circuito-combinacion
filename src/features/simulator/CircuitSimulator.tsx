import { useCallback } from 'react';
import type { CircuitDefinition } from '@/domain/circuit';
import { Schematic } from '@/features/schematic/Schematic';
import { useSettings } from '@/features/settings/settingsContext';
import { Legend } from './Legend';
import { MessagePanel } from './MessagePanel';
import { describe } from './message';
import styles from './SimulatorScreen.module.css';
import { StatusBar } from './StatusBar';
import { useDemo } from './useDemo';
import { useSimulator } from './useSimulator';

/** One circuit, live: schematic, explanation and controls. Remount it to start fresh. */
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
    <div className={styles.simulator}>
      <div className={styles.intro}>
        <p className={styles.circuitTitle}>
          <strong>{circuit.title}</strong>
        </p>
        <Legend />
      </div>
      <main className={styles.drawing}>
        <Schematic
          circuit={circuit}
          positions={sim.positions}
          state={sim.state}
          showTension={settings.showTension}
          highlightedDevice={sim.lastMoved}
          onToggle={onToggle}
        />
      </main>
      <div className={styles.panel}>
        <MessagePanel message={message} />
        <StatusBar
          lampOn={lampOn}
          demoRunning={demo.running}
          onReset={onReset}
          onToggleDemo={() => setRunning((running) => !running)}
        />
      </div>
    </div>
  );
}
