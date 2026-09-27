import { act, renderHook } from '@testing-library/react';
import { combinacionSimple } from '@/domain/catalog/combinacion-simple';
import { demoSequence } from '@/domain/circuit';
import { DEMO_STEP_MS, useDemo } from './useDemo';

describe('useDemo', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows each combination in turn, saying which switch moved, until stopped', () => {
    const show = vi.fn();
    const { result } = renderHook(() => useDemo(combinacionSimple, show));
    const sequence = demoSequence(combinacionSimple);

    act(() => result.current.setRunning(true));
    expect(show).toHaveBeenLastCalledWith(sequence[0], null);

    act(() => vi.advanceTimersByTime(DEMO_STEP_MS));
    expect(show).toHaveBeenLastCalledWith(sequence[1], expect.any(String));

    act(() => result.current.setRunning(false));
    const calls = show.mock.calls.length;
    act(() => vi.advanceTimersByTime(DEMO_STEP_MS * 3));
    expect(show).toHaveBeenCalledTimes(calls);
  });

  it('loops back to the start', () => {
    const show = vi.fn();
    const { result } = renderHook(() => useDemo(combinacionSimple, show));
    const sequence = demoSequence(combinacionSimple);

    act(() => result.current.setRunning(true));
    act(() => vi.advanceTimersByTime(DEMO_STEP_MS * sequence.length));
    expect(show).toHaveBeenLastCalledWith(sequence[0], expect.any(String));
  });
});
