import type { Device } from '@/domain/circuit';
import { es } from '@/i18n/es';

const SIDES = ['a', 'b'] as const;

/** Short description of a switch position, e.g. "Posición A" or "Cruzado". */
export function deviceStateText(device: Device, position: number): string {
  switch (device.kind) {
    case 'combinacion':
      return es.device.combinacion(SIDES[position] ?? 'a');
    case 'cruce':
      return es.device.cruce(position);
  }
}
