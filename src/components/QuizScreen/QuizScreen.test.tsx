import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Question } from '../../domain/question.ts';
import { initialQuizState, type QuizState } from '../../state/quizReducer.ts';
import { DEFAULT_SETTINGS, type Settings } from '../../storage/settings.ts';
import { QuizScreen } from './QuizScreen.tsx';

const mToKm: Question = { value: 80, from: 'm', to: 'km', answer: 0.08, step: 0, down: false };

const quizState = (patch: Partial<QuizState> = {}): QuizState => ({
  ...initialQuizState,
  screen: 'quiz',
  family: 'meter',
  total: 30,
  question: mToKm,
  ...patch,
});

function setup(state: QuizState = quizState(), settings: Settings = DEFAULT_SETTINGS) {
  const handlers = { onInput: vi.fn(), onCheck: vi.fn(), onNext: vi.fn(), onExit: vi.fn() };
  const view = render(<QuizScreen state={state} settings={settings} {...handlers} />);
  return { ...handlers, view };
}

describe('QuizScreen', () => {
  it('renders nothing without a round', () => {
    const { view } = setup(initialQuizState);
    expect(view.container).toBeEmptyDOMElement();
  });

  it('shows the header, ruler, question and ladder', () => {
    const { view } = setup(quizState({ index: 4 }));
    expect(screen.getByRole('main')).toHaveAttribute('data-family', 'meter');
    expect(screen.getByRole('heading', { level: 1, name: 'Öva på meter' })).toBeInTheDocument();
    expect(screen.getByText('Tal 5 av 30')).toBeInTheDocument();
    expect(screen.getByTestId('ruler')).toBeInTheDocument();
    expect(screen.getByText('80 m')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Svar i km' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Enhetsstegen/ })).toBeInTheDocument();
    expect(view.container.querySelectorAll('[data-testid="ruler"] [data-state]')).toHaveLength(31);
  });

  it('hides the ladder when turned off in settings', () => {
    setup(quizState(), { ...DEFAULT_SETTINGS, showLadder: false });
    expect(screen.queryByRole('heading', { name: /^Enhetsstegen/ })).not.toBeInTheDocument();
  });

  it('hides the factors when turned off in settings', () => {
    setup(quizState(), { ...DEFAULT_SETTINGS, showFactors: false });
    expect(screen.getByRole('heading', { name: /^Enhetsstegen/ })).toBeInTheDocument();
    expect(screen.queryByText(/×|÷/)).not.toBeInTheDocument();
  });

  it('wires typing, checking, moving on and exiting', async () => {
    const typing = setup(quizState({ input: '' }));
    await userEvent.type(screen.getByRole('textbox'), '8');
    expect(typing.onInput).toHaveBeenCalledWith('8');
    typing.view.unmount();

    const checking = setup(quizState({ input: '0,08' }));
    await userEvent.click(screen.getByRole('button', { name: 'rätta' }));
    expect(checking.onCheck).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Avsluta' }));
    expect(checking.onExit).toHaveBeenCalled();
    checking.view.unmount();

    const next = setup(quizState({ input: '0,08', checked: true, correct: true }));
    await userEvent.click(screen.getByRole('button', { name: 'nästa' }));
    expect(next.onNext).toHaveBeenCalled();
  });

  it('says klar on the last question', () => {
    setup(quizState({ index: 29, input: '0,08', checked: true, correct: true }));
    expect(screen.getByRole('button', { name: 'klar' })).toBeInTheDocument();
  });

  it('announces nothing before checking', () => {
    setup();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('announces a right answer', () => {
    setup(quizState({ input: '0,08', checked: true, correct: true }));
    expect(screen.getByRole('status')).toHaveTextContent('Rätt!');
  });

  it('announces a wrong answer with the right one', () => {
    setup(quizState({ input: '8', checked: true, correct: false }));
    expect(screen.getByRole('status')).toHaveTextContent('Fel! Rätt svar: 0,08 km');
  });
});
