import { FAMILY_KEYS, type FamilyKey } from '../domain/families.ts';
import { isRecord, loadJson, saveJson } from './storage.ts';

export interface RoundResult {
  score: number;
  total: number;
  /** ISO timestamp of when the round finished. */
  at: string;
}

export interface FamilyResults {
  best: RoundResult | null;
  last: RoundResult | null;
}

export type Results = Record<FamilyKey, FamilyResults>;

export const RESULTS_KEY = 'enheter:v1:results';

export function emptyResults(): Results {
  return {
    gram: { best: null, last: null },
    meter: { best: null, last: null },
    liter: { best: null, last: null },
  };
}

function normalizeRound(raw: unknown): RoundResult | null {
  if (!isRecord(raw)) return null;
  const { score, total, at } = raw;
  if (!Number.isInteger(score) || !Number.isInteger(total) || typeof at !== 'string') return null;
  const s = score as number;
  const t = total as number;
  if (t < 1 || s < 0 || s > t) return null;
  return { score: s, total: t, at };
}

/** Keeps every valid stored round; anything malformed is dropped. */
export function normalizeResults(raw: unknown): Results {
  const results = emptyResults();
  if (!isRecord(raw)) return results;
  for (const key of FAMILY_KEYS) {
    const entry = raw[key];
    if (!isRecord(entry)) continue;
    results[key] = { best: normalizeRound(entry.best), last: normalizeRound(entry.last) };
  }
  return results;
}

/**
 * True when `a` beats `b`: a higher share of right answers, or the same
 * share over a longer round.
 */
export function isBetter(a: RoundResult, b: RoundResult): boolean {
  const lhs = a.score * b.total;
  const rhs = b.score * a.total;
  return lhs > rhs || (lhs === rhs && a.total > b.total);
}

/** Records a finished round as `last`, and as `best` when it beats the old best. */
export function recordResult(results: Results, family: FamilyKey, round: RoundResult): Results {
  const { best } = results[family];
  return {
    ...results,
    [family]: {
      last: round,
      best: best === null || isBetter(round, best) ? round : best,
    },
  };
}

export function loadResults(): Results {
  return normalizeResults(loadJson(RESULTS_KEY));
}

export function saveResults(results: Results): boolean {
  return saveJson(RESULTS_KEY, results);
}
