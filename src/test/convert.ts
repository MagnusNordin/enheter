// No React or DOM imports: the Playwright helpers use this too.
import { FAMILIES, FAMILY_KEYS } from '../domain/families.ts';
import { roundAnswer } from '../domain/numbers.ts';

/** Converts `value` from one unit to another in the same family, independently of the app. */
export function convert(value: number, from: string, to: string): number {
  const family = FAMILY_KEYS.map((k) => FAMILIES[k]).find(
    (f) => f.units.includes(from) && f.units.includes(to),
  );
  if (!family) throw new Error(`No family has both ${from} and ${to}`);
  let result = value;
  let i = family.units.indexOf(from);
  const target = family.units.indexOf(to);
  while (i < target) result *= family.factors[i++]!;
  while (i > target) result /= family.factors[--i]!;
  return roundAnswer(result);
}
