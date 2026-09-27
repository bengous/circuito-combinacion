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

/** A live terminal is drawn larger, so tension is not told by colour alone. */
const TERMINAL_RADIUS = { idle: 5.5, live: 7.5 } as const;

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
        const live = showTension && state.live.has(id);
        return (
          <circle
            key={name}
            className={styles.terminal}
            data-live={live}
            cx={point.x}
            cy={point.y}
            r={live ? TERMINAL_RADIUS.live : TERMINAL_RADIUS.idle}
          />
        );
      })}
    </g>
  );
}
