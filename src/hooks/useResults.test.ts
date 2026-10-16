import { act, renderHook } from '@testing-library/react';
import { emptyResults, recordResult, RESULTS_KEY } from '../storage/results.ts';
import { useResults } from './useResults.ts';

const now = new Date('2026-10-16T12:00:00.000Z');
const later = new Date('2026-10-17T08:30:00.000Z');

describe('useResults', () => {
  it('starts empty and writes nothing on mount', () => {
    const { result } = renderHook(() => useResults());
    expect(result.current.results).toEqual(emptyResults());
    expect(localStorage.getItem(RESULTS_KEY)).toBeNull();
  });

  it('loads stored results on mount', () => {
    const stored = recordResult(emptyResults(), 'gram', {
      score: 9,
      total: 10,
      at: now.toISOString(),
    });
    localStorage.setItem(RESULTS_KEY, JSON.stringify(stored));
    const { result } = renderHook(() => useResults());
    expect(result.current.results).toEqual(stored);
  });

  it('records a round and persists it', () => {
    const { result } = renderHook(() => useResults());
    act(() => result.current.record('liter', 2, 3, now));
    const expected = { score: 2, total: 3, at: '2026-10-16T12:00:00.000Z' };
    expect(result.current.results.liter).toEqual({ best: expected, last: expected });
    expect(JSON.parse(localStorage.getItem(RESULTS_KEY)!)).toEqual(result.current.results);
  });

  it('tracks best and last across rounds', () => {
    const { result } = renderHook(() => useResults());
    act(() => result.current.record('meter', 28, 30, now));
    act(() => result.current.record('meter', 20, 30, later));
    expect(result.current.results.meter.best).toMatchObject({ score: 28, total: 30 });
    expect(result.current.results.meter.last).toMatchObject({
      score: 20,
      at: later.toISOString(),
    });
  });

  it('stamps the current time by default', () => {
    vi.useFakeTimers({ now: later });
    try {
      const { result } = renderHook(() => useResults());
      act(() => result.current.record('gram', 1, 3));
      expect(result.current.results.gram.last?.at).toBe(later.toISOString());
    } finally {
      vi.useRealTimers();
    }
  });
});
