import type { CircuitDefinition } from '@/domain/circuit';
import { combinacionConCruce } from './combinacion-con-cruce';
import { combinacionDosCruces } from './combinacion-dos-cruces';
import { combinacionSimple } from './combinacion-simple';

/** Every circuit offered in the app, in menu order. Add new circuits here. */
export const CATALOG: readonly CircuitDefinition[] = [
  combinacionSimple,
  combinacionConCruce,
  combinacionDosCruces,
];

export function findCircuit(id: string | undefined): CircuitDefinition | undefined {
  return CATALOG.find((circuit) => circuit.id === id);
}
