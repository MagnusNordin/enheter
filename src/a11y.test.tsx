import { render } from '@testing-library/react';
import { QuizScreen } from './components/QuizScreen/QuizScreen.tsx';
import { ResultScreen } from './components/ResultScreen/ResultScreen.tsx';
import { SettingsDialog } from './components/SettingsDialog/SettingsDialog.tsx';
import { StartScreen } from './components/StartScreen/StartScreen.tsx';
import type { Question } from './domain/question.ts';
import { initialQuizState, type QuizState } from './state/quizReducer.ts';
import { emptyResults, recordResult } from './storage/results.ts';
import { DEFAULT_SETTINGS } from './storage/settings.ts';
import { expectNoAxeViolations } from './test/axe.ts';

const noop = () => {};
const question: Question = { value: 40, from: 'dl', to: 'l', answer: 4, step: 0, down: false };
const quiz = (patch: Partial<QuizState> = {}): QuizState => ({
  ...initialQuizState,
  screen: 'quiz',
  family: 'liter',
  total: 30,
  index: 4,
  question,
  ...patch,
});
const handlers = { onInput: noop, onCheck: noop, onNext: noop, onExit: noop };

function stubCompact(matches: boolean) {
  vi.stubGlobal('matchMedia', (media: string) => ({
    matches,
    media,
    addEventListener: noop,
    removeEventListener: noop,
  }));
}

describe('accessibility (axe)', () => {
  it('start screen, before and after playing', async () => {
    const results = recordResult(emptyResults(), 'gram', {
      score: 24,
      total: 30,
      at: '2026-10-16T12:00:00.000Z',
    });
    const fresh = render(
      <StartScreen questions={30} results={emptyResults()} onPick={noop} onOpenSettings={noop} />,
    );
    await expectNoAxeViolations(fresh.container);
    fresh.unmount();

    const played = render(
      <StartScreen questions={30} results={results} onPick={noop} onOpenSettings={noop} />,
    );
    await expectNoAxeViolations(played.container);
  });

  it('settings dialog, with the ladder on and off', async () => {
    const on = render(
      <SettingsDialog open settings={DEFAULT_SETTINGS} onChange={noop} onClose={noop} />,
    );
    await expectNoAxeViolations(on.container);
    on.unmount();

    const off = render(
      <SettingsDialog
        open
        settings={{ ...DEFAULT_SETTINGS, showLadder: false }}
        onChange={noop}
        onClose={noop}
      />,
    );
    await expectNoAxeViolations(off.container);
  });

  it.each([
    ['unanswered', quiz()],
    ['typed', quiz({ input: '4' })],
    ['right', quiz({ input: '4', checked: true, correct: true })],
    ['wrong', quiz({ input: '400', checked: true, correct: false })],
    ['last question', quiz({ index: 29, input: '4', checked: true, correct: true })],
  ])('quiz screen, %s', async (_, state) => {
    const { container } = render(
      <QuizScreen state={state} settings={DEFAULT_SETTINGS} {...handlers} />,
    );
    await expectNoAxeViolations(container);
  });

  it('quiz screen on a phone without the ladder factors', async () => {
    stubCompact(true);
    const { container } = render(
      <QuizScreen
        state={quiz({ input: '4', checked: true, correct: false })}
        settings={{ ...DEFAULT_SETTINGS, showFactors: false }}
        {...handlers}
      />,
    );
    await expectNoAxeViolations(container);
  });

  it('quiz screen without the ladder', async () => {
    const { container } = render(
      <QuizScreen
        state={quiz()}
        settings={{ ...DEFAULT_SETTINGS, showLadder: false }}
        {...handlers}
      />,
    );
    await expectNoAxeViolations(container);
  });

  it('result screen', async () => {
    const history = Array.from({ length: 30 }, (_, i) => i % 5 !== 0);
    const { container } = render(
      <ResultScreen family="meter" score={24} total={30} history={history} onDone={noop} />,
    );
    await expectNoAxeViolations(container);
  });
});
