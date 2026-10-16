import type { Family } from '../../domain/families.ts';
import { buildLadder, stepLabel, UNIT_CAPTIONS, type LadderStep } from '../../domain/ladder.ts';
import type { Question } from '../../domain/question.ts';
import styles from './UnitLadder.module.css';

interface UnitLadderProps {
  family: Family;
  question: Question;
  showFactors: boolean;
  compact: boolean;
}

function Arrowhead({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="8"
      height="12"
      viewBox="0 0 8 12"
      className={styles.arrowhead}
      data-direction={direction}
    >
      <path
        d={direction === 'left' ? 'M7 1L1 6l6 5' : 'M1 1l6 5-6 5'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Step({
  step,
  showFactors,
  compact,
}: {
  step: LadderStep;
  showFactors: boolean;
  compact: boolean;
}) {
  return (
    <li className={styles.step} data-active={step.active}>
      {showFactors && <span className={styles.factor}>{stepLabel(step, compact)}</span>}
      <span className={styles.line}>
        {compact && step.direction === 'up' && <Arrowhead direction="left" />}
        <span className={styles.bar} />
        {compact && step.direction === 'down' && <Arrowhead direction="right" />}
      </span>
    </li>
  );
}

/** "Enhetsstegen": all units in the family with this question's step highlighted. */
export function UnitLadder({ family, question, showFactors, compact }: UnitLadderProps) {
  const items = buildLadder(family, question);
  return (
    <section className={styles.ladder}>
      <h2 className={styles.title}>
        Enhetsstegen · {compact ? 'störst till minst' : 'från störst till minst'}
      </h2>
      <ol className={styles.row}>
        {items.map((item, i) =>
          item.type === 'unit' ? (
            <li key={i} className={styles.unit} data-role={item.role}>
              <span className={styles.chip}>{item.unit}</span>
              <span className={styles.caption}>{UNIT_CAPTIONS[item.role]}</span>
            </li>
          ) : (
            <Step key={i} step={item} showFactors={showFactors} compact={compact} />
          ),
        )}
      </ol>
    </section>
  );
}
