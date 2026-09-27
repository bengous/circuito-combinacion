import type {
  CircuitDefinition,
  Conductor,
  Device,
  DeviceKind,
  TerminalId,
} from '@/domain/circuit';
import { terminalOf } from '@/domain/circuit';

export interface ChainStage {
  readonly id: string;
  readonly kind: DeviceKind;
  readonly name: string;
}

export interface ChainSpec {
  readonly id: string;
  readonly title: string;
  /** From the phase side to the lamp side: a combinacion, any number of cruces, a combinacion. */
  readonly stages: readonly ChainStage[];
}

const PHASE: TerminalId = 'L';
const NEUTRAL: TerminalId = 'N';
const LAMP_ID = 'lampara';
const SIDES = ['A', 'B'] as const;

/** Terminal where a bridge leaves a stage (towards the lamp). */
function exitOf(stage: ChainStage, side: (typeof SIDES)[number]): TerminalId {
  const name = stage.kind === 'cruce' ? `out${side}` : side.toLowerCase();
  return terminalOf(stage.id, name);
}

/** Terminal where a bridge enters a stage (from the phase). */
function entryOf(stage: ChainStage, side: (typeof SIDES)[number]): TerminalId {
  const name = stage.kind === 'cruce' ? `in${side}` : side.toLowerCase();
  return terminalOf(stage.id, name);
}

function validate(spec: ChainSpec): void {
  const kinds = spec.stages.map((s) => s.kind);
  const ends = kinds[0] === 'combinacion' && kinds.at(-1) === 'combinacion';
  const middle = kinds.slice(1, -1).every((k) => k === 'cruce');
  if (kinds.length < 2 || !ends || !middle) {
    throw new Error(`Circuit "${spec.id}": a chain is combinacion, cruce*, combinacion`);
  }
  if (new Set(spec.stages.map((s) => s.id)).size !== spec.stages.length) {
    throw new Error(`Circuit "${spec.id}": stage ids must be unique`);
  }
}

/** Wires a multi-point lighting circuit: phase, switches linked by bridges, lamp, neutral. */
export function defineChainCircuit(spec: ChainSpec): CircuitDefinition {
  validate(spec);
  const { stages } = spec;
  const first = stages[0] as ChainStage;
  const last = stages.at(-1) as ChainStage;

  const bridges: Conductor[] = stages.slice(1).flatMap((stage, i) => {
    const previous = stages[i] as ChainStage;
    return SIDES.map((side) => ({
      id: `puente-${i + 1}-${side.toLowerCase()}`,
      from: exitOf(previous, side),
      to: entryOf(stage, side),
      role: 'bridge' as const,
      label: `puente ${side}`,
    }));
  });

  const devices: Device[] = stages.map(({ id, kind, name }) => ({ id, kind, name }));
  return {
    id: spec.id,
    title: spec.title,
    pointsOfControl: stages.length,
    phase: PHASE,
    neutral: NEUTRAL,
    devices,
    lamps: [{ id: LAMP_ID, input: `${LAMP_ID}.in`, output: `${LAMP_ID}.out` }],
    conductors: [
      { id: 'fase', from: PHASE, to: terminalOf(first.id, 'common'), role: 'phase', label: 'fase' },
      ...bridges,
      {
        id: 'retorno',
        from: terminalOf(last.id, 'common'),
        to: `${LAMP_ID}.in`,
        role: 'return',
        label: 'retorno',
      },
      { id: 'neutro', from: `${LAMP_ID}.out`, to: NEUTRAL, role: 'neutral', label: 'neutro' },
    ],
    layout: { type: 'chain', order: stages.map((s) => s.id) },
  };
}
