import { type CSSProperties, useId, useMemo } from 'react';
import type { CircuitDefinition, CircuitState, Positions } from '@/domain/circuit';
import { es } from '@/i18n/es';
import { deviceStateText } from './deviceText';
import { layoutCircuit } from './geometry/layout';
import { ConductorLines } from './parts/ConductorLines';
import { DeviceHitArea } from './parts/DeviceHitArea';
import { DeviceSymbol } from './parts/DeviceSymbol';
import { Labels } from './parts/Labels';
import { LampSymbol } from './parts/LampSymbol';
import { Sources } from './parts/Sources';
import styles from './Schematic.module.css';

/**
 * Smallest zoom of the drawing at Normal text size, where its texts stay readable on a phone.
 * The floor grows with the text size setting (see `.frame` in Schematic.module.css).
 */
const MIN_SCALE = 0.85;

export interface SchematicProps {
  readonly circuit: CircuitDefinition;
  readonly positions: Positions;
  readonly state: CircuitState;
  readonly showTension: boolean;
  /** Switch moved last, outlined to connect the drawing with the message. */
  readonly highlightedDevice: string | null;
  readonly onToggle: (deviceId: string) => void;
}

/** Interactive drawing of a circuit. Pure view: all state comes from props. */
export function Schematic(props: SchematicProps) {
  const { circuit, positions, state, showTension, highlightedDevice, onToggle } = props;
  const titleId = useId();
  const geometry = useMemo(() => layoutCircuit(circuit), [circuit]);
  const lampOn = circuit.lamps.some((lamp) => state.lampsOn.has(lamp.id));

  const size = {
    '--drawing-width': geometry.width,
    '--drawing-height': geometry.height,
    '--min-scale': MIN_SCALE,
  } as CSSProperties;

  return (
    <div className={styles.frame} style={size}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        aria-labelledby={titleId}
      >
        <title id={titleId}>{es.schematic.label(circuit.title)}</title>
        {circuit.devices.map((device) => (
          <DeviceSymbol
            key={device.id}
            device={device}
            position={positions[device.id] ?? 0}
            geometry={geometry}
            state={state}
            showTension={showTension}
            highlighted={device.id === highlightedDevice}
          />
        ))}
        <ConductorLines
          circuit={circuit}
          geometry={geometry}
          state={state}
          showTension={showTension}
        />
        <Sources sources={geometry.sources} />
        <LampSymbol lamp={geometry.lamp} on={lampOn} />
        <Labels circuit={circuit} geometry={geometry} positions={positions} />
        {circuit.devices.map((device) => {
          const area = geometry.devices.get(device.id)?.hitArea;
          if (!area) return null;
          const stateText = deviceStateText(device, positions[device.id] ?? 0);
          return (
            <DeviceHitArea
              key={device.id}
              area={area}
              label={es.schematic.tapToChange(device.name, stateText)}
              onActivate={() => onToggle(device.id)}
            />
          );
        })}
      </svg>
    </div>
  );
}
