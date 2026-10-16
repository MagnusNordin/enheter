import { useCallback, useState } from 'react';
import type { FamilyKey } from '../domain/families.ts';
import { loadResults, recordResult, saveResults, type Results } from '../storage/results.ts';

export function useResults() {
  const [results, setResults] = useState<Results>(loadResults);

  const record = useCallback(
    (family: FamilyKey, score: number, total: number, now: Date = new Date()) => {
      const next = recordResult(results, family, { score, total, at: now.toISOString() });
      setResults(next);
      saveResults(next);
    },
    [results],
  );

  return { results, record };
}
