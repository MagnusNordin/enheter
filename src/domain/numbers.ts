// Digits with an optional comma or point decimal part, or a bare decimal part (",5").
const ANSWER_PATTERN = /^(\d+([.,]\d+)?|[.,]\d+)$/;

const formatter = new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 6 });

/**
 * Parses what the user typed. Accepts "0,5", "0.5", ",5" and spaces as
 * thousands separators ("80 000"). Returns null for anything else.
 */
export function parseAnswer(text: string): number | null {
  const compact = text.replace(/\s/g, '');
  if (!ANSWER_PATTERN.test(compact)) return null;
  return Number(compact.replace(',', '.'));
}

export function isCorrect(given: number | null, expected: number): boolean {
  if (given === null) return false;
  return Math.abs(given - expected) < 1e-9 * Math.max(1, Math.abs(expected));
}

/** Swedish number format: "0,08", "80 000" (with a non-breaking space). */
export function formatNumber(n: number): string {
  return formatter.format(n);
}

/** Rounds away float noise such as 0.07999999999999999. */
export function roundAnswer(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}
