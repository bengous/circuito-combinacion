import type { Installation } from './installation';
import type { StandardProfile } from './types';

function lookup(
  profile: StandardProfile,
  table: Readonly<Record<number, number>>,
  key: number,
  what: string,
): number {
  const value = table[key];
  if (value === undefined) throw new Error(`${profile.id.toUpperCase()}: no ${what}`);
  return value;
}

/**
 * I_Z of every conductor of the installation, by section, in A. Reads the correction factors
 * first, so an ambient or a conduit the standard does not cover fails even with no cable.
 * A value missing from a table throws: the standards give no interpolation.
 */
export function ampacityBySection(
  installation: Installation,
  profile: StandardProfile,
): (section: number) => number {
  const { base, temperature, grouping } = profile.ampacity;
  const { ambient, circuitsInConduit } = installation;
  const factor =
    lookup(profile, temperature, ambient, `temperature factor for ${ambient} °C`) *
    lookup(
      profile,
      grouping,
      circuitsInConduit,
      `grouping factor for ${circuitsInConduit} circuits in one conduit`,
    );
  return (section) => lookup(profile, base, section, `ampacity for ${section} mm²`) * factor;
}
