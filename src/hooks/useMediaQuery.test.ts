import { act, renderHook } from '@testing-library/react';
import { COMPACT_QUERY, useMediaQuery } from './useMediaQuery.ts';

function fakeMatchMedia(initial: boolean) {
  let matches = initial;
  const listeners = new Set<() => void>();
  const matchMedia = vi.fn((query: string) => ({
    get matches() {
      return matches;
    },
    media: query,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
  }));
  vi.stubGlobal('matchMedia', matchMedia);
  return {
    matchMedia,
    listeners,
    set(next: boolean) {
      matches = next;
      listeners.forEach((cb) => cb());
    },
  };
}

describe('useMediaQuery', () => {
  it('matches the 720px CSS breakpoint', () => {
    expect(COMPACT_QUERY).toBe('(max-width: 719px)');
  });

  it('is false without matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined);
    const { result } = renderHook(() => useMediaQuery(COMPACT_QUERY));
    expect(result.current).toBe(false);
  });

  it('reads the current match', () => {
    const media = fakeMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery(COMPACT_QUERY));
    expect(result.current).toBe(true);
    expect(media.matchMedia).toHaveBeenCalledWith(COMPACT_QUERY);
  });

  it('follows changes and unsubscribes on unmount', () => {
    const media = fakeMatchMedia(false);
    const { result, unmount } = renderHook(() => useMediaQuery(COMPACT_QUERY));
    expect(result.current).toBe(false);
    act(() => media.set(true));
    expect(result.current).toBe(true);
    expect(media.listeners.size).toBe(1);
    unmount();
    expect(media.listeners.size).toBe(0);
  });
});
