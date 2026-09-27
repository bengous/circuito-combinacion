/**
 * Vocabulary of the electrical model. A circuit is a graph:
 * terminals are the nodes; conductors and the contacts inside devices are the edges.
 */

/** A connection point, written `<owner>.<name>`, e.g. `llave1.common` or `L` for the phase. */
export type TerminalId = string;

/** What a cable is used for. Drives its default colour. */
export type ConductorRole = 'phase' | 'neutral' | 'return' | 'bridge';

/** A cable. It always conducts between its two ends. */
export interface Conductor {
  readonly id: string;
  readonly from: TerminalId;
  readonly to: TerminalId;
  readonly role: ConductorRole;
  /** Human name used in explanations, e.g. "puente A". */
  readonly label: string;
}

/** Kinds of devices the user can operate. See `devices.ts` for their behaviour. */
export type DeviceKind = 'combinacion' | 'cruce';

/** A switch placed in a circuit. */
export interface Device {
  readonly id: string;
  readonly kind: DeviceKind;
  /** Name shown to the user, e.g. "Llave 1". */
  readonly name: string;
}

/** A load between two terminals. It lights when one side has phase and the other neutral. */
export interface Lamp {
  readonly id: string;
  readonly input: TerminalId;
  readonly output: TerminalId;
}

/** How the schematic is drawn. Only chains exist today; other layouts can be added. */
export interface ChainLayout {
  readonly type: 'chain';
  /** Device ids from the phase side to the lamp side. */
  readonly order: readonly string[];
}

export type CircuitLayout = ChainLayout;

export interface CircuitDefinition {
  readonly id: string;
  readonly title: string;
  readonly pointsOfControl: number;
  readonly phase: TerminalId;
  readonly neutral: TerminalId;
  readonly devices: readonly Device[];
  readonly lamps: readonly Lamp[];
  readonly conductors: readonly Conductor[];
  readonly layout: CircuitLayout;
}

/** Position index of every device, keyed by device id. 0 is the rest position. */
export type Positions = Readonly<Record<string, number>>;

/** A conducting edge of the graph: a conductor or a closed contact inside a device. */
export interface Link {
  readonly id: string;
  readonly a: TerminalId;
  readonly b: TerminalId;
}

/** Result of solving a circuit for a given set of positions. */
export interface CircuitState {
  /** Terminals at phase potential (reachable from the phase without crossing a lamp). */
  readonly live: ReadonlySet<TerminalId>;
  /** Terminals connected to the neutral without crossing a lamp. */
  readonly neutral: ReadonlySet<TerminalId>;
  /** Ids of the links (conductors and contacts) that carry current. */
  readonly current: ReadonlySet<string>;
  /** Ids of the lamps that are on. */
  readonly lampsOn: ReadonlySet<string>;
}
