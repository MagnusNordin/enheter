import { isRecord, loadJson, saveJson } from './storage.ts';

describe('loadJson / saveJson', () => {
  it('round-trips a value', () => {
    expect(saveJson('k', { a: 1, b: [true] })).toBe(true);
    expect(loadJson('k')).toEqual({ a: 1, b: [true] });
  });

  it('returns null for a missing key', () => {
    expect(loadJson('missing')).toBeNull();
  });

  it('returns null for corrupt JSON', () => {
    localStorage.setItem('k', '{not json');
    expect(loadJson('k')).toBeNull();
  });

  it('survives getItem throwing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(loadJson('k')).toBeNull();
  });

  it('reports false when setItem throws (quota, private mode)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(saveJson('k', 1)).toBe(false);
  });

  it('works without localStorage at all', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(loadJson('k')).toBeNull();
    expect(saveJson('k', 1)).toBe(false);
  });
});

describe('isRecord', () => {
  it('accepts plain objects only', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ a: 1 })).toBe(true);
    expect(isRecord(null)).toBe(false);
    expect(isRecord([])).toBe(false);
    expect(isRecord('x')).toBe(false);
    expect(isRecord(1)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
  });
});
