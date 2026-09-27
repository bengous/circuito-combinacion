import type { CircuitDefinition, CircuitState } from '@/domain/circuit';
import { linkStatus } from '@/domain/circuit';
import { pointOf } from '../geometry/layout';
import type { SchematicGeometry } from '../geometry/types';
import { conductorStyle } from '../wireStyle';
import { WireLine } from './WireLine';

interface ConductorLinesProps {
  readonly circuit: CircuitDefinition;
  readonly geometry: SchematicGeometry;
  readonly state: CircuitState;
  readonly showTension: boolean;
}

/** Every cable of the circuit, drawn from terminal to terminal. */
export function ConductorLines({ circuit, geometry, state, showTension }: ConductorLinesProps) {
  return (
    <g>
      {circuit.conductors.map((conductor) => {
        const status = linkStatus(state, { id: conductor.id, a: conductor.from });
        return (
          <WireLine
            key={conductor.id}
            points={[pointOf(geometry, conductor.from), pointOf(geometry, conductor.to)]}
            look={conductorStyle(conductor.role, status, showTension)}
          />
        );
      })}
    </g>
  );
}
