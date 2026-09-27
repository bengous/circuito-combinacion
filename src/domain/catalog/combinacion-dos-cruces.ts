import { defineChainCircuit } from './chain';

/** Four points of control: two llaves de cruce between the two llaves de combinación. */
export const combinacionDosCruces = defineChainCircuit({
  id: 'combinacion-dos-cruces',
  title: 'Combinación con dos cruces',
  stages: [
    { id: 'llave1', kind: 'combinacion', name: 'Llave 1' },
    { id: 'cruce1', kind: 'cruce', name: 'Cruce 1' },
    { id: 'cruce2', kind: 'cruce', name: 'Cruce 2' },
    { id: 'llave2', kind: 'combinacion', name: 'Llave 2' },
  ],
});
