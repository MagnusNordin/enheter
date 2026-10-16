import { useId } from 'react';
import type { Family } from '../../domain/families.ts';
import type { FamilyResults } from '../../storage/results.ts';
import { ArrowRightIcon } from '../icons.tsx';
import { resultsText } from './resultsText.ts';
import styles from './UnitCard.module.css';

interface UnitCardProps {
  family: Family;
  results: FamilyResults;
  onPick: () => void;
}

export function UnitCard({ family, results, onPick }: UnitCardProps) {
  const resultsId = useId();
  const summary = resultsText(results);

  return (
    <button
      type="button"
      className={styles.card}
      data-family={family.key}
      onClick={onPick}
      aria-label={`Öva på ${family.name}: ${family.units.join(', ')}`}
      aria-describedby={summary ? resultsId : undefined}
    >
      <span className={styles.kind}>{family.kind}</span>
      <span className={styles.symbol} aria-hidden="true">
        {family.symbol}
      </span>
      <span className={styles.name}>{family.name}</span>
      {summary && (
        <span id={resultsId} className={styles.results}>
          {summary}
        </span>
      )}
      <span className={styles.chips}>
        {family.units.map((unit) => (
          <span key={unit} className={styles.chip}>
            {unit}
          </span>
        ))}
      </span>
      <span className={styles.go}>
        <span className={styles.goText}>Öva</span>
        <ArrowRightIcon size={20} />
      </span>
    </button>
  );
}
