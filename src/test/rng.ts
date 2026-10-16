import type { Rng } from '../domain/random.ts';

/** An rng that returns the given values in order, then repeats them. */
export function sequenceRng(...values: number[]): Rng {
  if (values.length === 0) throw new Error('sequenceRng needs at least one value');
  let i = 0;
  return () => values[i++ % values.length]!;
}

/**
 * Values for one rollQuestion call: step index, value (10–80), direction.
 * Picks the middle of each bucket so floor() lands where intended.
 */
export function questionRolls(stepCount: number, step: number, value: number, down: boolean) {
  return [(step + 0.5) / stepCount, (value / 10 - 1 + 0.5) / 8, down ? 0.25 : 0.75];
}
