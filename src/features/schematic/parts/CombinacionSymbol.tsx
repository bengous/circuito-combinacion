import type { CircuitState, Device } from '@/domain/circuit';
import { contactId, linkStatus, terminalOf } from '@/domain/circuit';
import { pointOf } from '../geometry/layout';
import type { Point, SchematicGeometry } from '../geometry/types';
import styles from '../Schematic.module.css';
import { contactStyle } from '../wireStyle';

interface CombinacionSymbolProps {
  readonly device: Device;
  readonly position: number;
  readonly geometry: SchematicGeometry;
  readonly state: CircuitState;
  readonly showTension: boolean;
}

const angle = (from: Point, to: Point) =>
  (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;

/**
 * The arm of a llave de combinación. It is always drawn towards terminal `a` and rotated
 * to reach the selected terminal, so the move can be animated with a CSS transition.
 */
export function CombinacionSymbol(props: CombinacionSymbolProps) {
  const { device, position, geometry, state, showTension } = props;
  const selected = position === 0 ? 'a' : 'b';
  const common = pointOf(geometry, terminalOf(device.id, 'common'));
  const restEnd = pointOf(geometry, terminalOf(device.id, 'a'));
  const target = pointOf(geometry, terminalOf(device.id, selected));
  const rotation = angle(common, target) - angle(common, restEnd);
  const status = linkStatus(state, {
    id: contactId(device.id, 'common', selected),
    a: terminalOf(device.id, 'common'),
  });

  return (
    <line
      className={styles.arm}
      x1={common.x}
      y1={common.y}
      x2={restEnd.x}
      y2={restEnd.y}
      data-tone={contactStyle(status, showTension).tone}
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: `${common.x}px ${common.y}px`,
      }}
    />
  );
}
