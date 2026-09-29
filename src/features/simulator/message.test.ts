import { combinacionSimple } from '@/domain/catalog/combinacion-simple';
import type { CircuitDefinition, Positions } from '@/domain/circuit';
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

  it('names the terminal when no cable brings the phase to the switch', () => {
    // The phase sits on a side terminal of the switch itself, so no conductor names it.
    const phaseOnSide: CircuitDefinition = {
      id: 'phase-on-side',
      title: 'Fase sobre un borne',
      pointsOfControl: 1,
      phase: 'llave1.a',
      neutral: 'neutro',
      devices: [{ id: 'llave1', kind: 'combinacion', name: 'Llave 1' }],
      lamps: [{ id: 'lampara', input: 'llave1.b', output: 'neutro' }],
      conductors: [],
      layout: { type: 'chain', order: ['llave1'] },
    };
    const positions = { llave1: 1 };

    expect(
      describeMessage(
        phaseOnSide,
        positions,
        diagnose(phaseOnSide, positions, solve(phaseOnSide, positions)),
        null,
        true,
      ),
    ).toEqual({
      moved: null,
      explanation:
        'La fase llega a la Llave 1 por el terminal A, pero la llave está en B. Circuito abierto.',
      warning: 'Ojo: el terminal A sigue con tensión.',
    });
  });
});
