import { screen } from '@testing-library/react';
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

/** Reads the question on screen ("40 dl = [ ] l") and returns the right answer. */
export function solveOnScreen(): number {
  const input = screen.getByRole('textbox', { name: /^Svar i / });
  const to = input.getAttribute('aria-label')!.replace('Svar i ', '');
  const promptId = input.getAttribute('aria-describedby')!.split(' ')[0]!;
  const prompt = document.getElementById(promptId)!.textContent!.replace('=', '').trim();
  const [value, from] = prompt.split(/\s+/);
  return convert(Number(value), from!, to);
}
