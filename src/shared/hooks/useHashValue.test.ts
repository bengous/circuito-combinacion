import { act, renderHook, waitFor } from '@testing-library/react';
import { decodeHash, useHashValue } from './useHashValue';

describe('decodeHash', () => {
  it('decodes an encoded hash', () => {
    expect(decodeHash('#combinaci%C3%B3n')).toBe('combinación');
    expect(decodeHash('plain')).toBe('plain');
    expect(decodeHash('')).toBe('');
  });

  it('returns malformed escapes as they are instead of throwing', () => {
    expect(decodeHash('#%E0%A4%A')).toBe('%E0%A4%A');
    expect(decodeHash('#100%')).toBe('100%');
  });
});

describe('useHashValue', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('reads and writes the hash', async () => {
    const { result } = renderHook(() => useHashValue());
    act(() => result.current[1]('combinacion-con-cruce'));
    expect(window.location.hash).toBe('#combinacion-con-cruce');
    await waitFor(() => expect(result.current[0]).toBe('combinacion-con-cruce'));
  });

  it('survives a broken hash', () => {
    window.location.hash = '#%E0%A4%A';
    const { result } = renderHook(() => useHashValue());
    expect(result.current[0]).toBe('%E0%A4%A');
  });
});
