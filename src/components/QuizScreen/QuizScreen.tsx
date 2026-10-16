import { FAMILIES } from '../../domain/families.ts';
import { answerText } from '../../domain/question.ts';
import { COMPACT_QUERY, useMediaQuery } from '../../hooks/useMediaQuery.ts';
import { isLastQuestion, type QuizState } from '../../state/quizReducer.ts';
import type { Settings } from '../../storage/settings.ts';
import { AnswerForm } from './AnswerForm.tsx';
import { ProgressRuler } from './ProgressRuler.tsx';
import { QuizHeader } from './QuizHeader.tsx';
import styles from './QuizScreen.module.css';
import { UnitLadder } from './UnitLadder.tsx';

interface QuizScreenProps {
  state: QuizState;
  settings: Settings;
  onInput: (text: string) => void;
  onCheck: () => void;
  onNext: () => void;
  onExit: () => void;
}

export function QuizScreen({ state, settings, onInput, onCheck, onNext, onExit }: QuizScreenProps) {
  const compact = useMediaQuery(COMPACT_QUERY);
  const { family: key, question } = state;
  if (!key || !question) return null;
  const family = FAMILIES[key];

  const announcement = !state.checked
    ? ''
    : state.correct
      ? 'Rätt!'
      : `Fel! Rätt svar: ${answerText(question)}`;

  return (
    <main className={styles.screen} data-family={family.key}>
      <h1 className="sr-only">Öva på {family.name}</h1>
      <QuizHeader family={family} index={state.index} total={state.total} onExit={onExit} />
      <ProgressRuler
        total={state.total}
        index={state.index}
        checked={state.checked}
        compact={compact}
      />
      <AnswerForm
        question={question}
        index={state.index}
        input={state.input}
        checked={state.checked}
        correct={state.correct}
        isLast={isLastQuestion(state)}
        onInput={onInput}
        onCheck={onCheck}
        onNext={onNext}
      />
      {settings.showLadder && (
        <UnitLadder
          family={family}
          question={question}
          showFactors={settings.showFactors}
          compact={compact}
        />
      )}
      <p className="sr-only" role="status">
        {announcement}
      </p>
    </main>
  );
}
