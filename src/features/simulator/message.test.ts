import { combinacionSimple } from '@/domain/catalog/combinacion-simple';
import type { Positions } from '@/domain/circuit';
import { diagnose, solve } from '@/domain/circuit';
import { describe as describeMessage } from './message';

const messageFor = (positions: Positions, lastMoved: string | null, showTension = true) =>
  describeMessage(
    combinacionSimple,
    positions,
    diagnose(combinacionSimple, positions, solve(combinacionSimple, positions)),
    lastMoved,
    showTension,
  );

describe('message', () => {
  it('explains a closed circuit', () => {
    expect(messageFor({ llave1: 0, llave2: 0 }, null)).toEqual({
      moved: null,
      explanation: expect.stringContaining('Circuito cerrado'),
      warning: null,
    });
  });

  it('says which switch moved and where the phase stops', () => {
    const message = messageFor({ llave1: 0, llave2: 1 }, 'llave2');
    expect(message.moved).toBe('Llave 2: posición B.');
    expect(message.explanation).toBe(
      'La fase llega a la Llave 2 por el puente A, pero la llave está en B. Circuito abierto.',
    );
    expect(message.warning).toBe('Ojo: el puente A sigue con tensión.');
  });

  it('drops the tension warning when tension is hidden', () => {
    expect(messageFor({ llave1: 1, llave2: 0 }, 'llave1', false).warning).toBeNull();
  });
});
