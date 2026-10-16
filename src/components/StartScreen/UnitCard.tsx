import { Fragment } from 'react';
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

// The button's name is its visible text ("Vikt gram kg hg g mg Öva"), so
// voice control users can say what they see (WCAG 2.5.3). The {' '} keep
// words apart in the name; grid and flex layout ignore them visually.
export function UnitCard({ family, results, onPick }: UnitCardProps) {
  const summary = resultsText(results);

  return (
    <button type="button" className={styles.card} data-family={family.key} onClick={onPick}>
      <span className={styles.kind}>{family.kind}</span>{' '}
      <span className={styles.symbol} aria-hidden="true">
        {family.symbol}
      </span>
      <span className={styles.name}>{family.name}</span>{' '}
      {summary && (
        <>
          <span className={styles.results}>{summary}</span>{' '}
        </>
      )}
      <span className={styles.chips}>
        {family.units.map((unit) => (
          <Fragment key={unit}>
            <span className={styles.chip}>{unit}</span>{' '}
          </Fragment>
        ))}
      </span>{' '}
      <span className={styles.go}>
        <span className={styles.goText}>Öva</span>
        <ArrowRightIcon size={20} />
      </span>
    </button>
  );
}
