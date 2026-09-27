import { defineChainCircuit } from './chain';

/** Three points of control: a llave de cruce between the two llaves de combinación. */
export const combinacionConCruce = defineChainCircuit({
  id: 'combinacion-con-cruce',
  title: 'Combinación con cruce',
  stages: [
    { id: 'llave1', kind: 'combinacion', name: 'Llave 1' },
    { id: 'cruce', kind: 'cruce', name: 'Cruce' },
    { id: 'llave2', kind: 'combinacion', name: 'Llave 2' },
  ],
});
