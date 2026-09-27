// Public API of the electrical model. Import from '@/domain/circuit'.
export { contactId, DEVICE_KINDS, terminalOf } from './devices';
export { type Diagnosis, diagnose } from './diagnose';
export { demoSequence, initialPositions, toggle } from './positions';
export { type ConductorStatus, linkStatus, solve } from './solve';
export type * from './types';
