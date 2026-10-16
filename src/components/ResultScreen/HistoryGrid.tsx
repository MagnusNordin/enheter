import styles from './HistoryGrid.module.css';

interface HistoryGridProps {
  /** One entry per question: true when it was right. */
  history: readonly boolean[];
}

/** One square per question, green when right and outlined red when wrong. */
export function HistoryGrid({ history }: HistoryGridProps) {
  return (
    <div className={styles.wrap}>
      <ol className={styles.grid} aria-label="Svar per tal">
        {history.map((right, i) => (
          <li key={i} className={styles.square} data-result={right ? 'correct' : 'wrong'}>
            <span className="sr-only">
              Tal {i + 1}: {right ? 'rätt' : 'fel'}
            </span>
          </li>
        ))}
      </ol>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.key}>
          <span className={styles.swatch} data-result="correct" />
          rätt
        </span>
        <span className={styles.key}>
          <span className={styles.swatch} data-result="wrong" />
          fel
        </span>
      </div>
    </div>
  );
}
