// Installations of the combinación simple, for the validelec sizing tests.
import { combinacionSimple } from '@/domain/catalog/combinacion-simple';
import type { CableRun, Installation } from '@/domain/validelec';

type Lengths = Readonly<Record<string, number>>;

/** Every conductor of the combinación simple in one section, with its own length in metres. */
function cables(lengths: Lengths, section = 1.5): Record<string, CableRun> {
  return Object.fromEntries(
    Object.entries(lengths).map(([id, length]) => [id, { section, length }]),
  );
}

/** Short 1,5 mm² cables behind a 10 A breaker: nothing to report. */
export const sound: Installation = {
  circuit: combinacionSimple,
  voltage: 220,
  breaker: 10,
  cables: cables({ fase: 6, 'puente-1-a': 4, 'puente-1-b': 4, retorno: 3, neutro: 8 }),
  loads: { lampara: { power: 100, powerFactor: 1 } },
  ambient: 30,
  circuitsInConduit: 1,
  supply: { board: 'main' },
};

/** 1000 W at the end of long cables: 100 m through bridge A, 130 m through bridge B. */
export const longLine: Installation = {
  ...sound,
  cables: cables({ fase: 30, 'puente-1-a': 10, 'puente-1-b': 40, retorno: 30, neutro: 30 }),
  loads: { lampara: { power: 1000, powerFactor: 1 } },
};
