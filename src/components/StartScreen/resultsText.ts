import type { FamilyResults, RoundResult } from '../../storage/results.ts';

const formatRound = (r: RoundResult) => `${r.score}/${r.total}`;

const NBSP = '\u00a0';

/**
 * "Bäst 28/30 · Senast 24/30", or null before the first finished round.
 * Non-breaking spaces keep each part whole, so a narrow card wraps at "·".
 */
export function resultsText({ best, last }: FamilyResults): string | null {
  if (!best || !last) return null;
  return `Bäst${NBSP}${formatRound(best)} · Senast${NBSP}${formatRound(last)}`;
}
