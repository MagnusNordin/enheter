import { defaultRng, mulberry32, randomInt } from './random.ts';

describe('mulberry32', () => {
  it('gives the same sequence for the same seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('gives different sequences for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect([a(), a(), a()]).not.toEqual([b(), b(), b()]);
  });

  it('stays in [0, 1)', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 10_000; i++) {
      const x = rng();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  it('accepts negative and fractional seeds', () => {
    expect(mulberry32(-5)()).toBe(mulberry32(-5)());
    expect(mulberry32(3.7)()).toBe(mulberry32(3)());
  });
});

describe('randomInt', () => {
  it('maps [0, 1) onto 0 … max-1', () => {
    expect(randomInt(() => 0, 8)).toBe(0);
    expect(randomInt(() => 0.999999, 8)).toBe(7);
    expect(randomInt(() => 0.5, 8)).toBe(4);
  });

  it('covers every value with a real rng', () => {
    const rng = mulberry32(99);
    const seen = new Set<number>();
    for (let i = 0; i < 1000; i++) seen.add(randomInt(rng, 5));
    expect([...seen].sort()).toEqual([0, 1, 2, 3, 4]);
  });
});

describe('defaultRng', () => {
  it('is Math.random', () => {
    expect(defaultRng).toBe(Math.random);
  });
});
