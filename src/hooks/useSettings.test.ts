import { act, renderHook } from '@testing-library/react';
import { DEFAULT_SETTINGS, SETTINGS_KEY } from '../storage/settings.ts';
import { useSettings } from './useSettings.ts';

const stored = () => JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null') as unknown;

describe('useSettings', () => {
  it('starts with defaults and writes nothing on mount', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    expect(stored()).toBeNull();
  });

  it('loads stored settings on mount', () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ questions: 10, showLadder: false, showFactors: true }),
    );
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toEqual({
      questions: 10,
      showLadder: false,
      showFactors: true,
    });
  });

  it('updates and persists a change', () => {
    const { result } = renderHook(() => useSettings());
    act(() => result.current.updateSettings({ questions: 12 }));
    expect(result.current.settings.questions).toBe(12);
    expect(stored()).toEqual({ ...DEFAULT_SETTINGS, questions: 12 });
  });

  it('keeps earlier changes when updating another field', () => {
    const { result } = renderHook(() => useSettings());
    act(() => result.current.updateSettings({ showLadder: false }));
    act(() => result.current.updateSettings({ showFactors: false }));
    expect(result.current.settings).toEqual({
      questions: 30,
      showLadder: false,
      showFactors: false,
    });
  });

  it('clamps out-of-range values', () => {
    const { result } = renderHook(() => useSettings());
    act(() => result.current.updateSettings({ questions: 500 }));
    expect(result.current.settings.questions).toBe(60);
  });

  it('still works when storage fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const { result } = renderHook(() => useSettings());
    act(() => result.current.updateSettings({ questions: 5 }));
    expect(result.current.settings.questions).toBe(5);
  });
});
