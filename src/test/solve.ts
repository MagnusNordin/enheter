import { screen } from '@testing-library/react';
import { convert } from './convert.ts';

/** Reads the question on screen ("40 dl = [ ] l") and returns the right answer. */
export function solveOnScreen(): number {
  const input = screen.getByRole('textbox', { name: /^Svar i / });
  const to = input.getAttribute('aria-label')!.replace('Svar i ', '');
  const promptId = input.getAttribute('aria-describedby')!.split(' ')[0]!;
  const prompt = document.getElementById(promptId)!.textContent!.replace('=', '').trim();
  const [value, from] = prompt.split(/\s+/);
  return convert(Number(value), from!, to);
}
