import { useEffect, useRef } from 'react';
import { FAMILIES, type FamilyKey } from '../../domain/families.ts';
import { HistoryGrid } from './HistoryGrid.tsx';
import styles from './ResultScreen.module.css';

interface ResultScreenProps {
  family: FamilyKey;
  score: number;
  total: number;
  history: readonly boolean[];
  onDone: () => void;
}

export function ResultScreen({ family, score, total, history, onDone }: ResultScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus here so keyboard and screen reader users land on the score.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <main className={styles.screen} data-family={family}>
      <div className={styles.content}>
        <p className={styles.kicker}>Resultat · {FAMILIES[family].name}</p>
        <h1 ref={headingRef} tabIndex={-1} className={styles.score}>
          <span>{score}</span>
          <span className={styles.total}>/{total}</span>
        </h1>
        <p className={styles.line}>
          Du fick {score} rätt av {total} tal.
        </p>
        <HistoryGrid history={history} />
      </div>
      <button type="button" className={styles.done} onClick={onDone}>
        klar
      </button>
    </main>
  );
}
