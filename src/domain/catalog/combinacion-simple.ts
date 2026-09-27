import { defineChainCircuit } from './chain';

/** Two points of control: two llaves de combinación linked by two bridges. */
export const combinacionSimple = defineChainCircuit({
  id: 'combinacion-simple',
  title: 'Combinación simple',
  stages: [
    { id: 'llave1', kind: 'combinacion', name: 'Llave 1' },
    { id: 'llave2', kind: 'combinacion', name: 'Llave 2' },
  ],
});
