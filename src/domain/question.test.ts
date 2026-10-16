import { questionRolls, sequenceRng } from '../test/rng.ts';
import { FAMILIES, FAMILY_KEYS } from './families.ts';
import { makeQuestion, MAX_VALUE, MIN_VALUE, sameQuestion, type Question } from './question.ts';
import { mulberry32 } from './random.ts';

const { gram, meter, liter } = FAMILIES;

describe('makeQuestion', () => {
  it('converts down to the smaller unit by multiplying', () => {
    const rng = sequenceRng(...questionRolls(3, 0, 40, true));
    expect(makeQuestion(liter, rng)).toEqual({
      value: 40,
      from: 'l',
      to: 'dl',
      answer: 400,
      step: 0,
      down: true,
    });
  });

  it('converts up to the bigger unit by dividing', () => {
    const rng = sequenceRng(...questionRolls(3, 0, 40, false));
    expect(makeQuestion(liter, rng)).toEqual({
      value: 40,
      from: 'dl',
      to: 'l',
      answer: 4,
      step: 0,
      down: false,
    });
  });

  it('handles the first and last step of a family', () => {
    const first = makeQuestion(meter, sequenceRng(...questionRolls(4, 0, 10, true)));
    expect(first).toMatchObject({ from: 'km', to: 'm', answer: 10_000 });

    const last = makeQuestion(meter, sequenceRng(...questionRolls(4, 3, 10, false)));
    expect(last).toMatchObject({ from: 'mm', to: 'cm', answer: 1 });
  });

  it('uses ×100 between hg and g', () => {
    const down = makeQuestion(gram, sequenceRng(...questionRolls(3, 1, 20, true)));
    expect(down).toMatchObject({ from: 'hg', to: 'g', answer: 2000 });

    const up = makeQuestion(gram, sequenceRng(...questionRolls(3, 1, 50, false)));
    expect(up).toMatchObject({ from: 'g', to: 'hg', answer: 0.5 });
  });

  it('uses ×1000 between g and mg', () => {
    const down = makeQuestion(gram, sequenceRng(...questionRolls(3, 2, 80, true)));
    expect(down).toMatchObject({ from: 'g', to: 'mg', answer: 80_000 });

    const up = makeQuestion(gram, sequenceRng(...questionRolls(3, 2, 80, false)));
    expect(up).toMatchObject({ from: 'mg', to: 'g', answer: 0.08 });
  });

  it('gives exact decimal answers without float noise', () => {
    const m = makeQuestion(meter, sequenceRng(...questionRolls(4, 0, 80, false)));
    expect(m).toMatchObject({ from: 'm', to: 'km', answer: 0.08 });

    const l = makeQuestion(liter, sequenceRng(...questionRolls(3, 0, 30, false)));
    expect(l).toMatchObject({ from: 'dl', to: 'l', answer: 3 });

    const kg = makeQuestion(gram, sequenceRng(...questionRolls(3, 0, 70, false)));
    expect(kg).toMatchObject({ from: 'hg', to: 'kg', answer: 7 });
  });

  it('uses the boundaries of the rng range', () => {
    const low = makeQuestion(liter, sequenceRng(0, 0, 0));
    expect(low).toMatchObject({ value: MIN_VALUE, step: 0, down: true });

    const high = makeQuestion(liter, sequenceRng(0.999999, 0.999999, 0.999999));
    expect(high).toMatchObject({ value: MAX_VALUE, step: 2, down: false, from: 'ml', to: 'cl' });
  });

  describe.each(FAMILY_KEYS)('%s over many random questions', (key) => {
    const family = FAMILIES[key];
    const rng = mulberry32(2026);
    const questions = Array.from({ length: 1000 }, () => makeQuestion(family, rng));

    it('always uses 10, 20 … 80', () => {
      const values = new Set(questions.map((q) => q.value));
      expect([...values].sort((a, b) => a - b)).toEqual([10, 20, 30, 40, 50, 60, 70, 80]);
    });

    it('always converts between neighbouring units', () => {
      for (const q of questions) {
        const fromIdx = family.units.indexOf(q.from);
        const toIdx = family.units.indexOf(q.to);
        expect(Math.abs(fromIdx - toIdx)).toBe(1);
        expect(Math.min(fromIdx, toIdx)).toBe(q.step);
        expect(toIdx > fromIdx).toBe(q.down);
      }
    });

    it('computes the answer from the step factor', () => {
      for (const q of questions) {
        const factor = family.factors[q.step]!;
        const expected = q.down ? q.value * factor : q.value / factor;
        expect(q.answer).toBeCloseTo(expected, 9);
      }
    });

    it('reaches every step in both directions', () => {
      const seen = new Set(questions.map((q) => `${q.step}:${q.down}`));
      expect(seen.size).toBe(family.factors.length * 2);
    });
  });

  it('never repeats the previous question', () => {
    const rng = mulberry32(7);
    let previous = makeQuestion(liter, rng);
    for (let i = 0; i < 2000; i++) {
      const next = makeQuestion(liter, rng, previous);
      expect(sameQuestion(next, previous)).toBe(false);
      previous = next;
    }
  });

  it('rerolls when the first roll equals the previous question', () => {
    const repeat = questionRolls(3, 1, 50, true);
    const other = questionRolls(3, 2, 20, false);
    const previous = makeQuestion(liter, sequenceRng(...repeat));
    const next = makeQuestion(liter, sequenceRng(...repeat, ...other), previous);
    expect(next).toMatchObject({ from: 'ml', to: 'cl', value: 20 });
  });

  it('gives up rerolling with an rng that never changes', () => {
    const rng = sequenceRng(0.1);
    const previous = makeQuestion(liter, rng);
    expect(makeQuestion(liter, rng, previous)).toEqual(previous);
  });

  it('works with the default rng', () => {
    const q = makeQuestion(meter);
    expect(meter.units).toContain(q.from);
    expect(meter.units).toContain(q.to);
  });
});

describe('sameQuestion', () => {
  const base: Question = { value: 40, from: 'dl', to: 'l', answer: 4, step: 0, down: false };

  it('compares value, from and to', () => {
    expect(sameQuestion(base, { ...base })).toBe(true);
    expect(sameQuestion(base, { ...base, value: 50, answer: 5 })).toBe(false);
    expect(sameQuestion(base, { ...base, from: 'l', to: 'dl', down: true, answer: 400 })).toBe(
      false,
    );
    expect(sameQuestion(base, { ...base, to: 'cl' })).toBe(false);
  });
});
