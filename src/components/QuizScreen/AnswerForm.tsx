import { useEffect, useId, useRef, type FormEvent } from 'react';
import { answerText, type Question } from '../../domain/question.ts';
import { ArrowRightIcon } from '../icons.tsx';
import styles from './AnswerForm.module.css';
import { Feedback } from './Feedback.tsx';

interface AnswerFormProps {
  question: Question;
  /** Changes with every new question, so the input can take focus again. */
  index: number;
  input: string;
  checked: boolean;
  correct: boolean;
  isLast: boolean;
  onInput: (text: string) => void;
  onCheck: () => void;
  onNext: () => void;
}

export function AnswerForm({
  question,
  index,
  input,
  checked,
  correct,
  isLast,
  onInput,
  onCheck,
  onNext,
}: AnswerFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const promptId = useId();
  const hintId = useId();
  const hasInput = input.trim() !== '';

  useEffect(() => {
    inputRef.current?.focus();
  }, [index]);

  // One form for both steps, so Enter checks the answer and Enter again moves on.
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (checked) onNext();
    else onCheck();
  };

  const state = checked ? (correct ? 'correct' : 'wrong') : 'open';

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.question}>
        <span id={promptId} className={styles.prompt}>
          <span>
            {question.value} {question.from}
          </span>{' '}
          <span className={styles.equals}>=</span>
        </span>
        <span className={styles.answerRow}>
          <input
            ref={inputRef}
            className={styles.input}
            data-state={state}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            aria-label={`Svar i ${question.to}`}
            aria-describedby={checked ? promptId : `${promptId} ${hintId}`}
            value={input}
            onChange={(event) => onInput(event.target.value)}
            readOnly={checked}
          />
          <span>{question.to}</span>
        </span>
      </div>

      <div className={styles.actions}>
        {checked ? (
          <div className={styles.result}>
            <Feedback correct={correct} answerText={answerText(question)} />
            <button type="submit" className={styles.primary}>
              {isLast ? 'klar' : 'nästa'}
              <ArrowRightIcon size={26} />
            </button>
          </div>
        ) : (
          <div className={styles.check}>
            <button type="submit" className={styles.primary} disabled={!hasInput}>
              rätta
            </button>
            <p id={hintId} className={styles.hint}>
              Decimaltal skriver du med komma, till exempel 0,5
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
