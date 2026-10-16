import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAMILIES } from '../../domain/families.ts';
import type { FamilyResults } from '../../storage/results.ts';
import { resultsText } from './resultsText.ts';
import { UnitCard } from './UnitCard.tsx';

const none: FamilyResults = { best: null, last: null };
const some: FamilyResults = {
  best: { score: 28, total: 30, at: '2026-10-16T12:00:00.000Z' },
  last: { score: 24, total: 30, at: '2026-10-17T12:00:00.000Z' },
};

describe('resultsText', () => {
  it('shows best and last', () => {
    expect(resultsText(some)).toBe('Bäst 28/30 · Senast 24/30');
  });

  it('is null until a round is played', () => {
    expect(resultsText(none)).toBeNull();
    expect(resultsText({ best: some.best, last: null })).toBeNull();
  });
});

describe('UnitCard', () => {
  it('shows the family with its units', () => {
    render(<UnitCard family={FAMILIES.meter} results={none} onPick={() => {}} />);
    const card = screen.getByRole('button', { name: 'Öva på meter: km, m, dm, cm, mm' });
    expect(card).toHaveAttribute('data-family', 'meter');
    expect(card).toHaveTextContent('Längd');
    expect(card).toHaveTextContent('meter');
    for (const unit of FAMILIES.meter.units) {
      expect(within(card).getAllByText(unit).length).toBeGreaterThan(0);
    }
    expect(card).toHaveTextContent('Öva');
  });

  it('hides the big symbol from screen readers', () => {
    const { container } = render(
      <UnitCard family={FAMILIES.gram} results={none} onPick={() => {}} />,
    );
    const hidden = container.querySelectorAll('[aria-hidden="true"]');
    expect([...hidden].some((el) => el.textContent === 'g')).toBe(true);
  });

  it('calls onPick when clicked', async () => {
    const onPick = vi.fn();
    render(<UnitCard family={FAMILIES.liter} results={none} onPick={onPick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onPick).toHaveBeenCalledTimes(1);
  });

  it('can be picked with the keyboard', async () => {
    const onPick = vi.fn();
    render(<UnitCard family={FAMILIES.liter} results={none} onPick={onPick} />);
    await userEvent.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onPick).toHaveBeenCalledTimes(2);
  });

  it('shows no results line before any round', () => {
    render(<UnitCard family={FAMILIES.gram} results={none} onPick={() => {}} />);
    expect(screen.queryByText(/Bäst/)).not.toBeInTheDocument();
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby');
  });

  it('shows and describes the card with stored results', () => {
    render(<UnitCard family={FAMILIES.gram} results={some} onPick={() => {}} />);
    expect(screen.getByText('Bäst 28/30 · Senast 24/30')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAccessibleDescription('Bäst 28/30 · Senast 24/30');
  });
});
