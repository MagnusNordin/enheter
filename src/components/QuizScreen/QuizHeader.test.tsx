import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAMILIES } from '../../domain/families.ts';
import { QuizHeader } from './QuizHeader.tsx';

describe('QuizHeader', () => {
  it('shows the family badge and progress', () => {
    render(<QuizHeader family={FAMILIES.gram} index={4} total={30} onExit={() => {}} />);
    expect(screen.getByText('gram')).toBeInTheDocument();
    expect(screen.getByText('· vikt')).toBeInTheDocument();
    expect(screen.getByText('Tal 5 av 30')).toBeInTheDocument();
  });

  it('counts from 1', () => {
    render(<QuizHeader family={FAMILIES.liter} index={0} total={3} onExit={() => {}} />);
    expect(screen.getByText('Tal 1 av 3')).toBeInTheDocument();
  });

  it('has an Avsluta button that exits', async () => {
    const onExit = vi.fn();
    render(<QuizHeader family={FAMILIES.meter} index={0} total={3} onExit={onExit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Avsluta' }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('hides the symbol circle from screen readers', () => {
    const { container } = render(
      <QuizHeader family={FAMILIES.meter} index={0} total={3} onExit={() => {}} />,
    );
    const hidden = [...container.querySelectorAll('[aria-hidden="true"]')];
    expect(hidden.some((el) => el.textContent === 'm')).toBe(true);
  });
});
