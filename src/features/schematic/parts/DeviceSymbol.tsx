import type { CircuitState, Device } from '@/domain/circuit';
import { DEVICE_KINDS, terminalOf } from '@/domain/circuit';
import { pointOf } from '../geometry/layout';
import type { SchematicGeometry } from '../geometry/types';
import styles from '../Schematic.module.css';
import { CombinacionSymbol } from './CombinacionSymbol';
import { CruceSymbol } from './CruceSymbol';

interface DeviceSymbolProps {
  readonly device: Device;
  readonly position: number;
  readonly geometry: SchematicGeometry;
  readonly state: CircuitState;
  readonly showTension: boolean;
  readonly highlighted: boolean;
}

/** Body, moving parts and terminals of one switch. */
export function DeviceSymbol(props: DeviceSymbolProps) {
  const { device, geometry, state, showTension, highlighted } = props;
  const body = geometry.devices.get(device.id)?.body;
  if (!body) return null;
  const Moving = device.kind === 'cruce' ? CruceSymbol : CombinacionSymbol;

  return (
    <g>
      <rect className={styles.body} data-highlighted={highlighted} rx={9} {...body} />
      <Moving {...props} />
      {DEVICE_KINDS[device.kind].terminals.map((name) => {
        const id = terminalOf(device.id, name);
        const point = pointOf(geometry, id);
        return (
          <circle
            key={name}
            className={styles.terminal}
            data-live={showTension && state.live.has(id)}
            cx={point.x}
            cy={point.y}
            r={5.5}
          />
        );
      })}
    </g>
  );
}
