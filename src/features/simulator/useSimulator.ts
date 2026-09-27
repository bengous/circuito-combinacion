import { useCallback, useMemo, useReducer } from 'react';
import type { CircuitDefinition, Positions } from '@/domain/circuit';
import { diagnose, initialPositions, solve, toggle } from '@/domain/circuit';

export interface SimulatorState {
  readonly positions: Positions;
  /** Switch moved last, if any. Drives the highlight and the message. */
  readonly lastMoved: string | null;
}

export type SimulatorAction =
  | { readonly type: 'toggle'; readonly deviceId: string }
  | { readonly type: 'reset' }
  | { readonly type: 'show'; readonly positions: Positions; readonly lastMoved: string | null };

function simulatorReducer(circuit: CircuitDefinition) {
  return (state: SimulatorState, action: SimulatorAction): SimulatorState => {
    switch (action.type) {
      case 'toggle':
        return {
          positions: toggle(circuit, state.positions, action.deviceId),
          lastMoved: action.deviceId,
        };
      case 'reset':
        return { positions: initialPositions(circuit), lastMoved: null };
      case 'show':
        return { positions: action.positions, lastMoved: action.lastMoved };
    }
  };
}

/** Switch positions of one circuit, plus everything derived from them. */
export function useSimulator(circuit: CircuitDefinition) {
  const reducer = useMemo(() => simulatorReducer(circuit), [circuit]);
  const [{ positions, lastMoved }, dispatch] = useReducer(reducer, {
    positions: initialPositions(circuit),
    lastMoved: null,
  });
  const state = useMemo(() => solve(circuit, positions), [circuit, positions]);
  const diagnosis = useMemo(() => diagnose(circuit, positions, state), [circuit, positions, state]);

  const toggleDevice = useCallback(
    (deviceId: string) => dispatch({ type: 'toggle', deviceId }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);
  const show = useCallback(
    (next: Positions, moved: string | null) =>
      dispatch({ type: 'show', positions: next, lastMoved: moved }),
    [],
  );

  return { positions, lastMoved, state, diagnosis, toggle: toggleDevice, reset, show };
}
