import type { CircuitState, Device } from '@/domain/circuit';
import { contactId, DEVICE_KINDS, linkStatus, terminalOf } from '@/domain/circuit';
import { pointOf } from '../geometry/layout';
import type { Point, SchematicGeometry } from '../geometry/types';
import styles from '../Schematic.module.css';
import { contactStyle } from '../wireStyle';
import { WireLine } from './WireLine';

interface CruceSymbolProps {
  readonly device: Device;
  readonly position: number;
  readonly geometry: SchematicGeometry;
  readonly state: CircuitState;
  readonly showTension: boolean;
}

/** S-shaped link between an entry (top) and an exit (bottom) of the cruce. */
function link(from: Point, to: Point): string {
  const middle = (from.y + to.y) / 2;
  return `M${from.x},${from.y} C${from.x},${middle} ${to.x},${middle} ${to.x},${to.y}`;
}

/**
 * The two internal links of a llave de cruce. Both positions are drawn and cross-faded,
 * which animates the change without morphing paths.
 */
export function CruceSymbol({ device, position, geometry, state, showTension }: CruceSymbolProps) {
  const spec = DEVICE_KINDS.cruce;
  const at = (name: string) => pointOf(geometry, terminalOf(device.id, name));
  return (
    <g>
      {[0, 1].map((option) => (
        <g key={option} className={styles.cruceOption} data-active={option === position}>
          {spec.contacts(option).map(([from, to]) => {
            const status = linkStatus(state, {
              id: contactId(device.id, from, to),
              a: terminalOf(device.id, from),
            });
            return (
              <WireLine
                key={`${from}-${to}`}
                d={link(at(from), at(to))}
                look={contactStyle(status, showTension)}
              />
            );
          })}
        </g>
      ))}
    </g>
  );
}
