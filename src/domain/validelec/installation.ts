import type { CircuitDefinition, Lamp } from '@/domain/circuit';

/** One conductor as laid: its section and its own length. */
export interface CableRun {
  /** mm². */
  readonly section: number;
  /** m, the length of this one conductor. */
  readonly length: number;
}

export interface LampLoad {
  /** W. */
  readonly power: number;
  /** cos φ, in ]0, 1]. */
  readonly powerFactor: number;
}

export type Supply =
  | { readonly board: 'main' }
  | {
      readonly board: 'sub';
      /** Voltage drop from the main board to the sub-board, as a fraction of U. */
      readonly upstreamDrop: number;
    };

/** A circuit as built in one place: what the sizing rules need on top of the wiring. */
export interface Installation {
  readonly circuit: CircuitDefinition;
  /** V, phase to neutral. */
  readonly voltage: number;
  /** Rated current I_n of the breaker, A. */
  readonly breaker: number;
  /** By conductor id. */
  readonly cables: Readonly<Record<string, CableRun>>;
  /** By lamp id. */
  readonly loads: Readonly<Record<string, LampLoad>>;
  /** Ambient temperature, °C. */
  readonly ambient: number;
  readonly circuitsInConduit: number;
  readonly supply: Supply;
}

function fail(installation: Installation, message: string): never {
  throw new Error(`Installation of "${installation.circuit.id}": ${message}`);
}

export function cableOf(installation: Installation, conductorId: string): CableRun {
  return (
    installation.cables[conductorId] ??
    fail(installation, `no cable for conductor "${conductorId}"`)
  );
}

/** The lamp of the circuit and its load. The sizing rules handle one lamp. */
export function lampOf(installation: Installation): { lamp: Lamp; load: LampLoad } {
  const { lamps } = installation.circuit;
  const [lamp] = lamps;
  if (!lamp || lamps.length !== 1) fail(installation, `one lamp, found ${lamps.length}`);
  const load = installation.loads[lamp.id] ?? fail(installation, `no load for lamp "${lamp.id}"`);
  return { lamp, load };
}

function expectPositive(installation: Installation, name: string, value: number): void {
  if (!(value > 0)) fail(installation, `${name} must be > 0, got ${value}`);
}

/** Refuses data the rules cannot judge: every value is checked once, here. */
export function validateInstallation(installation: Installation): void {
  const { circuit, cables, loads, supply } = installation;
  const { lamp, load } = lampOf(installation);
  const known = new Set(circuit.conductors.map((conductor) => conductor.id));
  for (const id of Object.keys(cables)) {
    if (!known.has(id)) fail(installation, `cable for unknown conductor "${id}"`);
  }
  for (const id of Object.keys(loads)) {
    if (id !== lamp.id) fail(installation, `load for unknown lamp "${id}"`);
  }
  for (const conductor of circuit.conductors) {
    const run = cableOf(installation, conductor.id);
    expectPositive(installation, `section of "${conductor.id}"`, run.section);
    expectPositive(installation, `length of "${conductor.id}"`, run.length);
  }
  expectPositive(installation, 'voltage', installation.voltage);
  expectPositive(installation, 'breaker', installation.breaker);
  expectPositive(installation, 'lamp power', load.power);
  if (!(load.powerFactor > 0 && load.powerFactor <= 1)) {
    fail(installation, `power factor must be in ]0, 1], got ${load.powerFactor}`);
  }
  if (supply.board === 'sub' && !(supply.upstreamDrop >= 0)) {
    fail(installation, `upstream drop must be >= 0, got ${supply.upstreamDrop}`);
  }
}
