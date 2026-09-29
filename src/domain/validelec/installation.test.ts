import { combinacionSimple } from '@/domain/catalog/combinacion-simple';
import { checkInstallation, type Installation } from '@/domain/validelec';
import { sound } from '@/test/installations';

const { neutro: _, ...withoutNeutral } = sound.cables;
const twoLamps = {
  ...combinacionSimple,
  lamps: [...combinacionSimple.lamps, { id: 'lampara2', input: 'l2.in', output: 'l2.out' }],
};

describe('checkInstallation refuses', () => {
  it.each([
    ['a conductor without cable', { cables: withoutNeutral }, /no cable for conductor "neutro"/],
    [
      'a cable for an unknown conductor',
      { cables: { ...sound.cables, extra: { section: 1.5, length: 1 } } },
      /cable for unknown conductor "extra"/,
    ],
    ['a lamp without load', { loads: {} }, /no load for lamp "lampara"/],
    [
      'a load for an unknown lamp',
      { loads: { ...sound.loads, otra: { power: 100, powerFactor: 1 } } },
      /load for unknown lamp "otra"/,
    ],
    ['a breaker of 0 A', { breaker: 0 }, /breaker must be > 0/],
    ['a power factor of 0', { loads: { lampara: { power: 100, powerFactor: 0 } } }, /power factor/],
    [
      'a power factor above 1',
      { loads: { lampara: { power: 100, powerFactor: 1.2 } } },
      /power factor/,
    ],
    [
      'a cable of 0 m',
      { cables: { ...sound.cables, fase: { section: 1.5, length: 0 } } },
      /length/,
    ],
    [
      'a negative upstream drop',
      { supply: { board: 'sub', upstreamDrop: -0.01 } },
      /upstream drop/,
    ],
    ['a circuit with two lamps', { circuit: twoLamps }, /one lamp, found 2/],
  ] satisfies ReadonlyArray<readonly [string, Partial<Installation>, RegExp]>)(
    '%s',
    (_, change, message) => {
      expect(() => checkInstallation({ ...sound, ...change }, 'aea')).toThrow(message);
    },
  );
});
