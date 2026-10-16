import { CheckIcon, CloseIcon } from '../icons.tsx';
import styles from './Feedback.module.css';

interface FeedbackProps {
  correct: boolean;
  /** The right answer with its unit, e.g. "4 l". */
  answerText: string;
}

/** Visible RÄTT!/FEL! result. Screen readers get it from the quiz's live region. */
export function Feedback({ correct, answerText }: FeedbackProps) {
  return (
    <div className={styles.feedback} data-result={correct ? 'correct' : 'wrong'}>
      <span className={styles.icon}>
        {correct ? (
          <CheckIcon size={40} strokeWidth={3} />
        ) : (
          <CloseIcon size={36} strokeWidth={3} />
        )}
      </span>
      <div className={styles.text}>
        <span className={styles.word}>{correct ? 'RÄTT!' : 'FEL!'}</span>
        {!correct && (
          <span className={styles.answer}>
            Rätt svar: <strong>{answerText}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
