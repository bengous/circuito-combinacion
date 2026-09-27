import { DEVICE_KINDS } from './devices';
import type { CircuitDefinition, Positions } from './types';

/** Every device in its rest position. */
export function initialPositions(circuit: CircuitDefinition): Positions {
  return Object.fromEntries(circuit.devices.map((device) => [device.id, 0]));
}

/** Moves one device to its next position. */
export function toggle(
  circuit: CircuitDefinition,
  positions: Positions,
  deviceId: string,
): Positions {
  const device = circuit.devices.find((d) => d.id === deviceId);
  if (!device) throw new Error(`Unknown device "${deviceId}" in circuit "${circuit.id}"`);
  const count = DEVICE_KINDS[device.kind].positionCount;
  return { ...positions, [deviceId]: ((positions[deviceId] ?? 0) + 1) % count };
}

/**
 * Every combination of positions, ordered so that only one switch moves between two steps
 * (Gray code). Used by the demo mode. Starts from the rest position.
 */
export function demoSequence(circuit: CircuitDefinition): Positions[] {
  const { devices } = circuit;
  if (devices.some((d) => DEVICE_KINDS[d.kind].positionCount !== 2)) {
    throw new Error('demoSequence only supports two-position devices');
  }
  return Array.from({ length: 2 ** devices.length }, (_, step) => {
    const gray = step ^ (step >> 1);
    return Object.fromEntries(devices.map((device, bit) => [device.id, (gray >> bit) & 1]));
  });
}
