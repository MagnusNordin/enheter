import type { Family } from './families.ts';
import { roundAnswer } from './numbers.ts';
import { defaultRng, randomInt, type Rng } from './random.ts';

export interface Question {
  /** Start value: 10, 20 … 80. */
  value: number;
  from: string;
  to: string;
  answer: number;
  /** Index of the step between `units[step]` and `units[step + 1]`. */
  step: number;
  /** True when converting to the smaller unit (multiply). */
  down: boolean;
}

export const MIN_VALUE = 10;
export const MAX_VALUE = 80;

// A family has at least 3 steps × 8 values × 2 directions = 48 questions,
// so a repeat is rare; the cap only guards against a degenerate rng.
const MAX_REROLLS = 50;

export function sameQuestion(a: Question, b: Question): boolean {
  return a.value === b.value && a.from === b.from && a.to === b.to;
}

function rollQuestion(family: Family, rng: Rng): Question {
  const step = randomInt(rng, family.units.length - 1);
  const value = MIN_VALUE * (1 + randomInt(rng, MAX_VALUE / MIN_VALUE));
  const down = rng() < 0.5;
  const factor = family.factors[step]!;
  const bigger = family.units[step]!;
  const smaller = family.units[step + 1]!;
  return {
    value,
    from: down ? bigger : smaller,
    to: down ? smaller : bigger,
    answer: roundAnswer(down ? value * factor : value / factor),
    step,
    down,
  };
}

/**
 * A question converting a value to the neighbouring unit, one step up or
 * down. Never the same question as `previous`.
 */
export function makeQuestion(family: Family, rng: Rng = defaultRng, previous?: Question): Question {
  let question = rollQuestion(family, rng);
  for (let i = 0; previous && sameQuestion(question, previous) && i < MAX_REROLLS; i++) {
    question = rollQuestion(family, rng);
  }
  return question;
}
