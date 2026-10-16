import type { FamilyKey } from '../domain/families.ts';
import { isCorrect, parseAnswer } from '../domain/numbers.ts';
import type { Question } from '../domain/question.ts';

export type Screen = 'start' | 'quiz' | 'result';

export interface QuizState {
  screen: Screen;
  family: FamilyKey | null;
  /** Questions in this round. */
  total: number;
  /** Zero-based index of the current question. */
  index: number;
  question: Question | null;
  input: string;
  checked: boolean;
  correct: boolean;
  score: number;
  /** One entry per checked question: true when it was right. */
  history: boolean[];
}

// Questions are made outside the reducer and passed in, so the reducer
// stays pure (React may call it twice) and tests control every question.
export type QuizAction =
  | { type: 'start'; family: FamilyKey; total: number; question: Question }
  | { type: 'input'; text: string }
  | { type: 'check' }
  | { type: 'next'; question?: Question }
  | { type: 'exit' };

export const initialQuizState: QuizState = {
  screen: 'start',
  family: null,
  total: 0,
  index: 0,
  question: null,
  input: '',
  checked: false,
  correct: false,
  score: 0,
  history: [],
};

export function isLastQuestion(state: QuizState): boolean {
  return state.index + 1 >= state.total;
}

export function hasInput(state: QuizState): boolean {
  return state.input.trim() !== '';
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'start':
      return {
        ...initialQuizState,
        screen: 'quiz',
        family: action.family,
        total: Math.max(1, action.total),
        question: action.question,
      };

    case 'input':
      if (state.screen !== 'quiz' || state.checked) return state;
      return { ...state, input: action.text };

    case 'check': {
      if (state.screen !== 'quiz' || state.checked || !state.question || !hasInput(state)) {
        return state;
      }
      const correct = isCorrect(parseAnswer(state.input), state.question.answer);
      return {
        ...state,
        checked: true,
        correct,
        score: state.score + (correct ? 1 : 0),
        history: [...state.history, correct],
      };
    }

    case 'next':
      if (state.screen !== 'quiz' || !state.checked) return state;
      if (isLastQuestion(state)) return { ...state, screen: 'result' };
      if (!action.question) return state;
      return {
        ...state,
        index: state.index + 1,
        question: action.question,
        input: '',
        checked: false,
        correct: false,
      };

    case 'exit':
      return initialQuizState;
  }
}
