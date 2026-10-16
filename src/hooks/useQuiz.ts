import { useCallback, useReducer } from 'react';
import { FAMILIES, type FamilyKey } from '../domain/families.ts';
import { makeQuestion } from '../domain/question.ts';
import { defaultRng, type Rng } from '../domain/random.ts';
import { initialQuizState, isLastQuestion, quizReducer } from '../state/quizReducer.ts';

export interface RoundSummary {
  family: FamilyKey;
  score: number;
  total: number;
}

export interface UseQuizOptions {
  rng?: Rng;
  /** Called once when the last question is passed and the result screen opens. */
  onRoundComplete?: (summary: RoundSummary) => void;
}

export function useQuiz({ rng = defaultRng, onRoundComplete }: UseQuizOptions = {}) {
  const [state, dispatch] = useReducer(quizReducer, initialQuizState);

  const start = useCallback(
    (family: FamilyKey, total: number) => {
      dispatch({ type: 'start', family, total, question: makeQuestion(FAMILIES[family], rng) });
    },
    [rng],
  );

  const setInput = useCallback((text: string) => dispatch({ type: 'input', text }), []);

  const check = useCallback(() => dispatch({ type: 'check' }), []);

  const next = useCallback(() => {
    if (state.screen !== 'quiz' || !state.checked || !state.family) return;
    if (isLastQuestion(state)) {
      dispatch({ type: 'next' });
      onRoundComplete?.({ family: state.family, score: state.score, total: state.total });
      return;
    }
    const question = makeQuestion(FAMILIES[state.family], rng, state.question);
    dispatch({ type: 'next', question });
  }, [state, rng, onRoundComplete]);

  const exit = useCallback(() => dispatch({ type: 'exit' }), []);

  return { state, start, setInput, check, next, exit };
}
