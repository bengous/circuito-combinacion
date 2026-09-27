import { useEffect, useState } from 'react';
import type { CircuitDefinition, Positions } from '@/domain/circuit';
import { demoSequence } from '@/domain/circuit';

export const DEMO_STEP_MS = 1500;

function movedDevice(before: Positions, after: Positions): string | null {
  return Object.keys(after).find((id) => before[id] !== after[id]) ?? null;
}

/** Plays every combination, one switch at a time, while `running` is true. */
export function useDemo(
  circuit: CircuitDefinition,
  show: (positions: Positions, moved: string | null) => void,
) {
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const sequence = demoSequence(circuit);
    let step = 0;
    const first = sequence[0];
    if (first) show(first, null);
    const timer = setInterval(() => {
      const before = sequence[step];
      step = (step + 1) % sequence.length;
      const after = sequence[step];
      if (before && after) show(after, movedDevice(before, after));
    }, DEMO_STEP_MS);
    return () => clearInterval(timer);
  }, [running, circuit, show]);

  return { running, setRunning };
}
