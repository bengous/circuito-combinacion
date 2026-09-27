import { conductorStyle, contactStyle } from './wireStyle';

describe('conductorStyle', () => {
  it('paints a live bridge in the phase colour when tension is shown', () => {
    expect(conductorStyle('bridge', 'live', true)).toEqual({
      tone: 'phase',
      flowing: false,
      strong: true,
    });
  });

  it('keeps the role colour when tension is hidden', () => {
    expect(conductorStyle('bridge', 'live', false)).toEqual({
      tone: 'bridge',
      flowing: false,
      strong: false,
    });
    expect(conductorStyle('return', 'current', false)).toEqual({
      tone: 'return',
      flowing: true,
      strong: true,
    });
  });

  it('never paints the neutral as live', () => {
    expect(conductorStyle('neutral', 'current', true).tone).toBe('neutral');
  });

  it('fades dead cables', () => {
    expect(conductorStyle('return', 'dead', true)).toEqual({
      tone: 'dead',
      flowing: false,
      strong: false,
    });
  });
});

describe('contactStyle', () => {
  it('highlights a closed path without tension display', () => {
    expect(contactStyle('current', false).tone).toBe('active');
    expect(contactStyle('live', false).tone).toBe('arm');
  });
});
