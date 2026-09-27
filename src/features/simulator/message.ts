import type { CircuitDefinition, Diagnosis, Positions } from '@/domain/circuit';
import { deviceStateText } from '@/features/schematic/deviceText';
import { es } from '@/i18n/es';

export interface Message {
  /** What just changed, e.g. "Llave 2: posición b." */
  readonly moved: string | null;
  /** Why the lamp is on or off. */
  readonly explanation: string;
  /** Safety note about cables that stay live. */
  readonly warning: string | null;
}

/** Turns the model's diagnosis into sentences for the message panel. */
export function describe(
  circuit: CircuitDefinition,
  positions: Positions,
  diagnosis: Diagnosis,
  lastMoved: string | null,
  showTension: boolean,
): Message {
  const device = circuit.devices.find((d) => d.id === lastMoved);
  const moved = device
    ? es.message.moved(device.name, deviceStateText(device, positions[device.id] ?? 0))
    : null;

  switch (diagnosis.kind) {
    case 'closed':
      return { moved, explanation: es.message.closed, warning: null };
    case 'open': {
      const via = diagnosis.liveConductor?.label ?? `borne ${diagnosis.arrivesAt.toUpperCase()}`;
      return {
        moved,
        explanation: es.message.open(diagnosis.device.name, via, diagnosis.setTo),
        warning: showTension ? es.message.stillLive(via) : null,
      };
    }
    case 'unknown':
      return { moved, explanation: es.message.openUnknown, warning: null };
  }
}
