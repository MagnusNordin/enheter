import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type { Question } from '../../domain/question.ts';
import { AnswerForm } from './AnswerForm.tsx';

const dlToL: Question = { value: 40, from: 'dl', to: 'l', answer: 4, step: 0, down: false };
const mToKm: Question = { value: 80, from: 'm', to: 'km', answer: 0.08, step: 0, down: false };

type Props = Parameters<typeof AnswerForm>[0];

function setup(overrides: Partial<Props> = {}) {
  const props: Props = {
    question: dlToL,
    index: 0,
    input: '',
    checked: false,
    correct: false,
    isLast: false,
    onInput: vi.fn(),
    onCheck: vi.fn(),
    onNext: vi.fn(),
    ...overrides,
  };
  const view = render(<AnswerForm {...props} />);
  const input = () => screen.getByRole('textbox', { name: `Svar i ${props.question.to}` });
  return { props, view, input };
}

/** Keeps the typed text in state, like the app does. */
function Controlled(props: Omit<Props, 'input' | 'onInput'>) {
  const [input, setInput] = useState('');
  return <AnswerForm {...props} input={input} onInput={setInput} />;
}

describe('AnswerForm', () => {
  it('shows the question with the target unit', () => {
    const { input } = setup();
    expect(screen.getByText('40 dl')).toBeInTheDocument();
    expect(screen.getByText('=')).toBeInTheDocument();
    expect(screen.getByText('l', { selector: 'span' })).toBeInTheDocument();
    expect(input()).toHaveAttribute('inputmode', 'decimal');
    expect(input()).toHaveAttribute('autocomplete', 'off');
  });

  it('describes the input with the question and the decimal hint', () => {
    const { input } = setup();
    expect(input()).toHaveAccessibleDescription(
      '40 dl = Decimaltal skriver du med komma, till exempel 0,5',
    );
  });

  it('focuses the input', () => {
    const { input } = setup();
    expect(input()).toHaveFocus();
  });

  it('focuses the input again on a new question', () => {
    const { props, view, input } = setup();
    input().blur();
    view.rerender(<AnswerForm {...props} question={mToKm} index={1} />);
    expect(screen.getByRole('textbox', { name: 'Svar i km' })).toHaveFocus();
  });

  it('reports typing', async () => {
    const { props, input } = setup();
    await userEvent.type(input(), '4');
    expect(props.onInput).toHaveBeenCalledWith('4');
  });

  it('disables rätta until something is typed', () => {
    setup({ input: '  ' });
    expect(screen.getByRole('button', { name: 'rätta' })).toBeDisabled();
  });

  it('checks with the rätta button', async () => {
    const { props } = setup({ input: '4' });
    await userEvent.click(screen.getByRole('button', { name: 'rätta' }));
    expect(props.onCheck).toHaveBeenCalledTimes(1);
    expect(props.onNext).not.toHaveBeenCalled();
  });

  it('checks with Enter', async () => {
    const onCheck = vi.fn();
    render(
      <Controlled
        question={dlToL}
        index={0}
        checked={false}
        correct={false}
        isLast={false}
        onCheck={onCheck}
        onNext={vi.fn()}
      />,
    );
    await userEvent.type(screen.getByRole('textbox'), '4{Enter}');
    expect(onCheck).toHaveBeenCalledTimes(1);
  });

  it('shows RÄTT! and nästa after a right answer', () => {
    const { input } = setup({ input: '4', checked: true, correct: true });
    expect(screen.getByText('RÄTT!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'nästa' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'rätta' })).not.toBeInTheDocument();
    expect(input()).toHaveAttribute('readonly');
    expect(input()).toHaveAttribute('data-state', 'correct');
  });

  it('shows FEL! and the right answer in Swedish format after a wrong answer', () => {
    const { input } = setup({ question: mToKm, input: '8', checked: true, correct: false });
    expect(screen.getByText('FEL!')).toBeInTheDocument();
    expect(screen.getByText('0,08 km')).toBeInTheDocument();
    expect(input()).toHaveAttribute('data-state', 'wrong');
  });

  it('leaves the input open before checking', () => {
    const { input } = setup({ input: '4' });
    expect(input()).not.toHaveAttribute('readonly');
    expect(input()).toHaveAttribute('data-state', 'open');
  });

  it('moves on with nästa', async () => {
    const { props } = setup({ input: '4', checked: true, correct: true });
    await userEvent.click(screen.getByRole('button', { name: 'nästa' }));
    expect(props.onNext).toHaveBeenCalledTimes(1);
    expect(props.onCheck).not.toHaveBeenCalled();
  });

  it('moves on with Enter after checking', async () => {
    const { props, input } = setup({ input: '4', checked: true, correct: true });
    await userEvent.type(input(), '{Enter}');
    expect(props.onNext).toHaveBeenCalledTimes(1);
  });

  it('says klar on the last question', () => {
    setup({ input: '4', checked: true, correct: true, isLast: true });
    expect(screen.getByRole('button', { name: 'klar' })).toBeInTheDocument();
  });
});
