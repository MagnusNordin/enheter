/** A source of random numbers in [0, 1), like `Math.random`. */
export type Rng = () => number;

export const defaultRng: Rng = Math.random;

/** Small seeded PRNG so tests and e2e helpers get repeatable rounds. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random integer in [0, max). */
export function randomInt(rng: Rng, max: number): number {
  return Math.floor(rng() * max);
}
