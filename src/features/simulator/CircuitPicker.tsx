import type { CircuitDefinition } from '@/domain/circuit';
import { es } from '@/i18n/es';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';

interface CircuitPickerProps {
  readonly circuits: readonly CircuitDefinition[];
  readonly selected: CircuitDefinition;
  readonly onSelect: (id: string) => void;
}

/** Chooses the circuit by its number of control points. */
export function CircuitPicker({ circuits, selected, onSelect }: CircuitPickerProps) {
  return (
    <SegmentedControl
      label={es.picker.label}
      options={circuits.map((circuit) => ({
        value: circuit.id,
        label: es.picker.option(circuit.pointsOfControl),
      }))}
      value={selected.id}
      onChange={onSelect}
    />
  );
}
