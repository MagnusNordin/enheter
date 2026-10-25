import {
  clampQuestions,
  DEFAULT_SETTINGS,
  loadSettings,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  normalizeSettings,
  saveSettings,
  SETTINGS_KEY,
} from './settings.ts';

describe('DEFAULT_SETTINGS', () => {
  it('matches the design: 15 questions, ladder and factors shown', () => {
    expect(DEFAULT_SETTINGS).toEqual({ questions: 15, showLadder: true, showFactors: true });
    expect([MIN_QUESTIONS, MAX_QUESTIONS]).toEqual([3, 60]);
  });
});

describe('clampQuestions', () => {
  it.each([
    [3, 3],
    [30, 30],
    [60, 60],
    [2, 3],
    [0, 3],
    [-10, 3],
    [61, 60],
    [1000, 60],
    [12.4, 12],
    [12.6, 13],
  ])('%d → %d', (input, expected) => {
    expect(clampQuestions(input)).toBe(expected);
  });
});

describe('normalizeSettings', () => {
  it('keeps valid values', () => {
    const settings = { questions: 10, showLadder: false, showFactors: false };
    expect(normalizeSettings(settings)).toEqual(settings);
  });

  it('falls back to defaults for anything that is not an object', () => {
    for (const raw of [null, undefined, 'x', 5, [], true]) {
      expect(normalizeSettings(raw)).toEqual(DEFAULT_SETTINGS);
    }
  });

  it('replaces only the invalid fields', () => {
    expect(normalizeSettings({ questions: '10', showLadder: false, showFactors: 'yes' })).toEqual({
      questions: 15,
      showLadder: false,
      showFactors: true,
    });
  });

  it('clamps the question count', () => {
    expect(normalizeSettings({ questions: 1 }).questions).toBe(3);
    expect(normalizeSettings({ questions: 99 }).questions).toBe(60);
  });

  it('rejects non-finite numbers', () => {
    expect(normalizeSettings({ questions: Number.NaN }).questions).toBe(15);
    expect(normalizeSettings({ questions: Infinity }).questions).toBe(15);
  });

  it('drops unknown fields', () => {
    expect(normalizeSettings({ ...DEFAULT_SETTINGS, theme: 'dark' })).toEqual(DEFAULT_SETTINGS);
  });
});

describe('loadSettings / saveSettings', () => {
  it('loads defaults when nothing is stored', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('saves and loads settings', () => {
    const settings = { questions: 12, showLadder: true, showFactors: false };
    expect(saveSettings(settings)).toBe(true);
    expect(JSON.parse(localStorage.getItem(SETTINGS_KEY)!)).toEqual(settings);
    expect(loadSettings()).toEqual(settings);
  });

  it('repairs a bad stored value', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ questions: 500, showLadder: 'no' }));
    expect(loadSettings()).toEqual({ questions: 60, showLadder: true, showFactors: true });
  });
});
