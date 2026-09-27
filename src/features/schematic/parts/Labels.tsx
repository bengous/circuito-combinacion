import type { CircuitDefinition, Positions } from '@/domain/circuit';
import { es } from '@/i18n/es';
import { deviceStateText } from '../deviceText';
import type { SchematicGeometry } from '../geometry/types';
import styles from '../Schematic.module.css';

interface LabelsProps {
  readonly circuit: CircuitDefinition;
  readonly geometry: SchematicGeometry;
  readonly positions: Positions;
}

/** Texts of the schematic: sources, lamp, switch names and states, bridge letters. */
export function Labels({ circuit, geometry, positions }: LabelsProps) {
  const { phase, neutral } = geometry.sources;
  return (
    <g>
      <text className={styles.sourceText} x={phase.label.x} y={phase.label.y}>
        {es.schematic.phase}
      </text>
      <text className={styles.sourceText} x={neutral.label.x} y={neutral.label.y}>
        {es.schematic.neutral}
      </text>
      <text className={styles.nameText} x={geometry.lamp.label.x} y={geometry.lamp.label.y}>
        {es.schematic.lamp}
      </text>
      {circuit.devices.map((device) => {
        const label = geometry.devices.get(device.id)?.label;
        if (!label) return null;
        return (
          <text key={device.id} x={label.x} y={label.y}>
            <tspan className={styles.nameText}>{device.name}</tspan>
            <tspan className={styles.stateText} x={label.x} dy="1.25em">
              {deviceStateText(device, positions[device.id] ?? 0)}
            </tspan>
          </text>
        );
      })}
      {geometry.bridgeLabels.map((mark) => (
        <text
          key={`${mark.text}-${mark.at.y}`}
          className={styles.bridgeText}
          x={mark.at.x}
          y={mark.at.y}
          textAnchor={mark.anchor}
        >
          {mark.text}
        </text>
      ))}
    </g>
  );
}
