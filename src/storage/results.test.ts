import {
  emptyResults,
  isBetter,
  loadResults,
  normalizeResults,
  recordResult,
  RESULTS_KEY,
  saveResults,
  type RoundResult,
} from './results.ts';

const at = '2026-10-16T12:00:00.000Z';
const round = (score: number, total: number, when = at): RoundResult => ({
  score,
  total,
  at: when,
});

describe('emptyResults', () => {
  it('has no rounds for any family', () => {
    expect(emptyResults()).toEqual({
      gram: { best: null, last: null },
      meter: { best: null, last: null },
      liter: { best: null, last: null },
    });
  });

  it('returns a new object each time', () => {
    expect(emptyResults()).not.toBe(emptyResults());
  });
});

describe('isBetter', () => {
  it('compares the share of right answers', () => {
    expect(isBetter(round(28, 30), round(24, 30))).toBe(true);
    expect(isBetter(round(24, 30), round(28, 30))).toBe(false);
    expect(isBetter(round(3, 3), round(29, 30))).toBe(true);
    expect(isBetter(round(9, 10), round(28, 30))).toBe(false);
  });

  it('prefers the longer round on a tie', () => {
    expect(isBetter(round(30, 30), round(3, 3))).toBe(true);
    expect(isBetter(round(3, 3), round(30, 30))).toBe(false);
    expect(isBetter(round(15, 30), round(5, 10))).toBe(true);
  });

  it('is false for an identical result', () => {
    expect(isBetter(round(20, 30), round(20, 30))).toBe(false);
  });
});

describe('recordResult', () => {
  it('sets best and last on the first round', () => {
    const next = recordResult(emptyResults(), 'gram', round(20, 30));
    expect(next.gram).toEqual({ best: round(20, 30), last: round(20, 30) });
  });

  it('replaces best with a better round', () => {
    let results = recordResult(emptyResults(), 'gram', round(20, 30));
    results = recordResult(results, 'gram', round(25, 30, 'later'));
    expect(results.gram).toEqual({ best: round(25, 30, 'later'), last: round(25, 30, 'later') });
  });

  it('keeps best after a worse round', () => {
    let results = recordResult(emptyResults(), 'gram', round(25, 30));
    results = recordResult(results, 'gram', round(10, 30, 'later'));
    expect(results.gram).toEqual({ best: round(25, 30), last: round(10, 30, 'later') });
  });

  it('keeps the earlier best on an identical result', () => {
    let results = recordResult(emptyResults(), 'gram', round(25, 30));
    results = recordResult(results, 'gram', round(25, 30, 'later'));
    expect(results.gram.best).toEqual(round(25, 30));
    expect(results.gram.last).toEqual(round(25, 30, 'later'));
  });

  it('keeps families apart', () => {
    const results = recordResult(emptyResults(), 'meter', round(5, 10));
    expect(results.gram).toEqual({ best: null, last: null });
    expect(results.liter).toEqual({ best: null, last: null });
    expect(results.meter.last).toEqual(round(5, 10));
  });

  it('does not change the input', () => {
    const before = emptyResults();
    recordResult(before, 'liter', round(1, 3));
    expect(before).toEqual(emptyResults());
  });
});

describe('normalizeResults', () => {
  it('keeps valid stored results', () => {
    const stored = recordResult(emptyResults(), 'liter', round(2, 3));
    expect(normalizeResults(stored)).toEqual(stored);
  });

  it('gives empty results for anything that is not an object', () => {
    for (const raw of [null, undefined, 'x', 3, []]) {
      expect(normalizeResults(raw)).toEqual(emptyResults());
    }
  });

  it('skips families that are not objects', () => {
    expect(normalizeResults({ gram: 'x', meter: null })).toEqual(emptyResults());
  });

  it.each([
    ['not an object', 'x'],
    ['missing score', { total: 3, at }],
    ['fractional score', { score: 1.5, total: 3, at }],
    ['negative score', { score: -1, total: 3, at }],
    ['score above total', { score: 4, total: 3, at }],
    ['zero total', { score: 0, total: 0, at }],
    ['string total', { score: 1, total: '3', at }],
    ['missing date', { score: 1, total: 3 }],
  ])('drops a round with %s', (_, bad) => {
    const results = normalizeResults({ gram: { best: bad, last: round(1, 3) } });
    expect(results.gram).toEqual({ best: null, last: round(1, 3) });
  });

  it('drops unknown families and fields', () => {
    const results = normalizeResults({
      kelvin: { best: round(1, 3) },
      gram: { best: { ...round(1, 3), extra: true }, last: null },
    });
    expect(results).toEqual({ ...emptyResults(), gram: { best: round(1, 3), last: null } });
  });
});

describe('loadResults / saveResults', () => {
  it('loads empty results when nothing is stored', () => {
    expect(loadResults()).toEqual(emptyResults());
  });

  it('saves and loads results', () => {
    const results = recordResult(emptyResults(), 'meter', round(7, 10));
    expect(saveResults(results)).toBe(true);
    expect(JSON.parse(localStorage.getItem(RESULTS_KEY)!)).toEqual(results);
    expect(loadResults()).toEqual(results);
  });

  it('ignores corrupt stored data', () => {
    localStorage.setItem(RESULTS_KEY, '][');
    expect(loadResults()).toEqual(emptyResults());
  });
});
