import type { Device, DeviceKind, Link, TerminalId } from './types';

interface DeviceKindSpec {
  /** Terminal names, local to the device. */
  readonly terminals: readonly string[];
  /** Number of positions the device can take. */
  readonly positionCount: number;
  /** Pairs of terminals joined inside the device for a given position. */
  readonly contacts: (position: number) => ReadonlyArray<readonly [string, string]>;
}

/**
 * Behaviour of each kind of switch.
 * - combinacion (3-way switch): the common terminal goes to `a` or to `b`.
 * - cruce (4-way / intermediate switch): passes both bridges straight or crossed.
 */
export const DEVICE_KINDS: Readonly<Record<DeviceKind, DeviceKindSpec>> = {
  combinacion: {
    terminals: ['common', 'a', 'b'],
    positionCount: 2,
    contacts: (position) => [['common', position === 0 ? 'a' : 'b']],
  },
  cruce: {
    terminals: ['inA', 'inB', 'outA', 'outB'],
    positionCount: 2,
    contacts: (position) =>
      position === 0
        ? [
            ['inA', 'outA'],
            ['inB', 'outB'],
          ]
        : [
            ['inA', 'outB'],
            ['inB', 'outA'],
          ],
  },
};

export function terminalOf(deviceId: string, name: string): TerminalId {
  return `${deviceId}.${name}`;
}

export function contactId(deviceId: string, from: string, to: string): string {
  return `${deviceId}:${from}-${to}`;
}

/** Closed contacts of a device, as graph links. */
export function deviceLinks(device: Device, position: number): Link[] {
  return DEVICE_KINDS[device.kind].contacts(position).map(([from, to]) => ({
    id: contactId(device.id, from, to),
    a: terminalOf(device.id, from),
    b: terminalOf(device.id, to),
  }));
}
