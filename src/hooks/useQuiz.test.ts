import { act, renderHook } from '@testing-library/react';
import { FAMILIES } from '../domain/families.ts';
import { makeQuestion } from '../domain/question.ts';
import { mulberry32 } from '../domain/random.ts';
import { initialQuizState } from '../state/quizReducer.ts';
import { useQuiz, type UseQuizOptions } from './useQuiz.ts';

function setup(options: UseQuizOptions = {}) {
  const resolved = { rng: mulberry32(1), ...options };
  return renderHook(() => useQuiz(resolved));
}

/** Types the right (or a wrong) answer for the current question and checks it. */
function answer(result: ReturnType<typeof setup>['result'], right: boolean) {
  const q = result.current.state.question!;
  act(() => result.current.setInput(String(right ? q.answer : q.answer + 1)));
  act(() => result.current.check());
}

describe('useQuiz', () => {
  it('starts on the start screen', () => {
    const { result } = setup();
    expect(result.current.state).toEqual(initialQuizState);
  });

  it('starts a round with a question from the chosen family', () => {
    const { result } = setup();
    act(() => result.current.start('meter', 5));
    const { state } = result.current;
    expect(state).toMatchObject({ screen: 'quiz', family: 'meter', total: 5, index: 0 });
    expect(FAMILIES.meter.units).toContain(state.question!.from);
  });

  it('makes the same questions as makeQuestion with the same seed', () => {
    const { result } = setup({ rng: mulberry32(5) });
    act(() => result.current.start('gram', 3));
    expect(result.current.state.question).toEqual(makeQuestion(FAMILIES.gram, mulberry32(5)));
  });

  it('checks answers and moves on with a new question', () => {
    const { result } = setup();
    act(() => result.current.start('liter', 3));
    const first = result.current.state.question!;
    answer(result, true);
    expect(result.current.state).toMatchObject({ checked: true, correct: true, score: 1 });

    act(() => result.current.next());
    expect(result.current.state).toMatchObject({ index: 1, checked: false, input: '' });
    expect(result.current.state.question).not.toEqual(first);
  });

  it('ignores next before the answer is checked', () => {
    const { result } = setup();
    act(() => result.current.start('liter', 3));
    const before = result.current.state;
    act(() => result.current.next());
    expect(result.current.state).toBe(before);
  });

  it('ignores next on the start screen', () => {
    const onRoundComplete = vi.fn();
    const { result } = setup({ onRoundComplete });
    act(() => result.current.next());
    expect(result.current.state).toEqual(initialQuizState);
    expect(onRoundComplete).not.toHaveBeenCalled();
  });

  it('opens the result and reports the round once after the last question', () => {
    const onRoundComplete = vi.fn();
    const { result } = setup({ onRoundComplete });
    act(() => result.current.start('gram', 3));
    answer(result, true);
    act(() => result.current.next());
    answer(result, false);
    act(() => result.current.next());
    answer(result, true);
    act(() => result.current.next());

    expect(result.current.state).toMatchObject({
      screen: 'result',
      score: 2,
      total: 3,
      history: [true, false, true],
    });
    expect(onRoundComplete).toHaveBeenCalledTimes(1);
    expect(onRoundComplete).toHaveBeenCalledWith({ family: 'gram', score: 2, total: 3 });

    act(() => result.current.next());
    expect(onRoundComplete).toHaveBeenCalledTimes(1);
  });

  it('finishes without a callback', () => {
    const { result } = setup();
    act(() => result.current.start('gram', 3));
    for (let i = 0; i < 3; i++) {
      answer(result, true);
      act(() => result.current.next());
    }
    expect(result.current.state.screen).toBe('result');
  });

  it('exits to start without reporting', () => {
    const onRoundComplete = vi.fn();
    const { result } = setup({ onRoundComplete });
    act(() => result.current.start('liter', 3));
    answer(result, true);
    act(() => result.current.exit());
    expect(result.current.state).toEqual(initialQuizState);
    expect(onRoundComplete).not.toHaveBeenCalled();
  });

  it('works with the default rng', () => {
    const { result } = renderHook(() => useQuiz());
    act(() => result.current.start('liter', 3));
    expect(result.current.state.question).not.toBeNull();
  });
});
