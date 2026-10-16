import type { FamilyResults, RoundResult } from '../../storage/results.ts';

const formatRound = (r: RoundResult) => `${r.score}/${r.total}`;

/** "Bäst 28/30 · Senast 24/30", or null before the first finished round. */
export function resultsText({ best, last }: FamilyResults): string | null {
  if (!best || !last) return null;
  return `Bäst ${formatRound(best)} · Senast ${formatRound(last)}`;
}
