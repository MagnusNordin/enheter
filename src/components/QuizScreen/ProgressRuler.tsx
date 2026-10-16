import { buildRuler } from '../../domain/ruler.ts';
import styles from './ProgressRuler.module.css';

interface ProgressRulerProps {
  total: number;
  index: number;
  checked: boolean;
  compact: boolean;
}

/** The yellow folding-rule strip. Decorative: "Tal X av Y" is the readable progress. */
export function ProgressRuler({ total, index, checked, compact }: ProgressRulerProps) {
  const ticks = buildRuler({ total, current: index, checked, compact });
  return (
    <div className={styles.ruler} aria-hidden="true" data-testid="ruler">
      {ticks.map((tick) => (
        <div key={tick.index} className={styles.slot}>
          <div className={styles.tick} data-state={tick.state} data-major={tick.major} />
          {tick.label !== null && <span className={styles.label}>{tick.label}</span>}
        </div>
      ))}
    </div>
  );
}
