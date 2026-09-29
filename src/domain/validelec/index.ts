// Public API of the electrical rules. Import from '@/domain/validelec'.
export { checkCircuit, checkInstallation } from './check';
export type { CableRun, Installation } from './installation';
export { STANDARDS } from './standards';
export type * from './types';
