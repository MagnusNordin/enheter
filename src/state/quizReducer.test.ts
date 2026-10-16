import type { Question } from '../domain/question.ts';
import {
  hasInput,
  initialQuizState,
  isLastQuestion,
  quizReducer,
  type QuizAction,
  type QuizState,
} from './quizReducer.ts';

const q1: Question = { value: 40, from: 'dl', to: 'l', answer: 4, step: 0, down: false };
const q2: Question = { value: 30, from: 'l', to: 'dl', answer: 300, step: 0, down: true };
const q3: Question = { value: 80, from: 'm', to: 'km', answer: 0.08, step: 0, down: false };

function run(state: QuizState, ...actions: QuizAction[]): QuizState {
  return actions.reduce(quizReducer, state);
}

function started(total = 3, question = q1): QuizState {
  return quizReducer(initialQuizState, { type: 'start', family: 'liter', total, question });
}

describe('quizReducer', () => {
  describe('start', () => {
    it('opens the quiz with a fresh round', () => {
      expect(started(30)).toEqual({
        screen: 'quiz',
        family: 'liter',
        total: 30,
        index: 0,
        question: q1,
        input: '',
        checked: false,
        correct: false,
        score: 0,
        history: [],
      });
    });

    it('resets a round in progress', () => {
      const midway = run(started(), { type: 'input', text: '4' }, { type: 'check' });
      const restarted = quizReducer(midway, {
        type: 'start',
        family: 'meter',
        total: 5,
        question: q3,
      });
      expect(restarted).toMatchObject({ family: 'meter', total: 5, score: 0, history: [] });
    });

    it('needs at least one question', () => {
      expect(started(0).total).toBe(1);
    });
  });

  describe('input', () => {
    it('updates the typed text', () => {
      expect(run(started(), { type: 'input', text: '0,5' }).input).toBe('0,5');
    });

    it('is ignored after checking', () => {
      const state = run(started(), { type: 'input', text: '4' }, { type: 'check' });
      expect(quizReducer(state, { type: 'input', text: '5' })).toBe(state);
    });

    it('is ignored outside the quiz', () => {
      expect(quizReducer(initialQuizState, { type: 'input', text: '4' })).toBe(initialQuizState);
    });
  });

  describe('check', () => {
    it('marks a right answer and adds to the score', () => {
      const state = run(started(), { type: 'input', text: '4' }, { type: 'check' });
      expect(state).toMatchObject({ checked: true, correct: true, score: 1, history: [true] });
    });

    it('accepts decimal answers with comma', () => {
      const state = run(started(3, q3), { type: 'input', text: '0,08' }, { type: 'check' });
      expect(state.correct).toBe(true);
    });

    it('marks a wrong answer without adding to the score', () => {
      const state = run(started(), { type: 'input', text: '400' }, { type: 'check' });
      expect(state).toMatchObject({ checked: true, correct: false, score: 0, history: [false] });
    });

    it('marks unreadable input as wrong', () => {
      const state = run(started(), { type: 'input', text: 'fyra' }, { type: 'check' });
      expect(state).toMatchObject({ checked: true, correct: false });
    });

    it('does nothing with empty or blank input', () => {
      const empty = started();
      expect(quizReducer(empty, { type: 'check' })).toBe(empty);
      const blank = run(started(), { type: 'input', text: '   ' });
      expect(quizReducer(blank, { type: 'check' })).toBe(blank);
    });

    it('does not count the same question twice', () => {
      const once = run(started(), { type: 'input', text: '4' }, { type: 'check' });
      expect(quizReducer(once, { type: 'check' })).toBe(once);
    });

    it('does nothing outside the quiz', () => {
      expect(quizReducer(initialQuizState, { type: 'check' })).toBe(initialQuizState);
    });

    it('does nothing without a question', () => {
      const broken: QuizState = { ...started(), question: null, input: '4' };
      expect(quizReducer(broken, { type: 'check' })).toBe(broken);
    });
  });

  describe('next', () => {
    it('moves to the next question and clears the answer', () => {
      const state = run(
        started(),
        { type: 'input', text: '4' },
        { type: 'check' },
        { type: 'next', question: q2 },
      );
      expect(state).toMatchObject({
        screen: 'quiz',
        index: 1,
        question: q2,
        input: '',
        checked: false,
        correct: false,
        score: 1,
        history: [true],
      });
    });

    it('needs the question to be checked first', () => {
      const state = run(started(), { type: 'input', text: '4' });
      expect(quizReducer(state, { type: 'next', question: q2 })).toBe(state);
    });

    it('needs a new question when it is not the last one', () => {
      const state = run(started(), { type: 'input', text: '4' }, { type: 'check' });
      expect(quizReducer(state, { type: 'next' })).toBe(state);
    });

    it('opens the result after the last question', () => {
      const state = run(
        started(1),
        { type: 'input', text: '4' },
        { type: 'check' },
        { type: 'next' },
      );
      expect(state).toMatchObject({ screen: 'result', score: 1, total: 1, history: [true] });
    });

    it('does nothing outside the quiz', () => {
      expect(quizReducer(initialQuizState, { type: 'next', question: q2 })).toBe(initialQuizState);
    });
  });

  describe('exit', () => {
    it('goes back to start from the quiz', () => {
      const state = run(
        started(),
        { type: 'input', text: '4' },
        { type: 'check' },
        { type: 'exit' },
      );
      expect(state).toEqual(initialQuizState);
    });

    it('goes back to start from the result', () => {
      const result = run(
        started(1),
        { type: 'input', text: '4' },
        { type: 'check' },
        { type: 'next' },
      );
      expect(quizReducer(result, { type: 'exit' })).toEqual(initialQuizState);
    });
  });

  it('plays a whole round', () => {
    const answers: Array<[Question, string]> = [
      [q1, '4'],
      [q2, '30'],
      [q3, '0.08'],
    ];
    let state = initialQuizState;
    answers.forEach(([question, text], i) => {
      state =
        i === 0
          ? quizReducer(state, { type: 'start', family: 'liter', total: 3, question })
          : quizReducer(state, { type: 'next', question });
      expect(state.index).toBe(i);
      state = run(state, { type: 'input', text }, { type: 'check' });
    });
    state = quizReducer(state, { type: 'next' });
    expect(state).toMatchObject({
      screen: 'result',
      score: 2,
      total: 3,
      history: [true, false, true],
    });
  });
});

describe('isLastQuestion', () => {
  it('is true on the final question only', () => {
    expect(isLastQuestion(started(3))).toBe(false);
    expect(isLastQuestion({ ...started(3), index: 1 })).toBe(false);
    expect(isLastQuestion({ ...started(3), index: 2 })).toBe(true);
    expect(isLastQuestion(started(1))).toBe(true);
  });
});

describe('hasInput', () => {
  it('ignores surrounding spaces', () => {
    expect(hasInput({ ...started(), input: '' })).toBe(false);
    expect(hasInput({ ...started(), input: '  ' })).toBe(false);
    expect(hasInput({ ...started(), input: ' 4 ' })).toBe(true);
  });
});
