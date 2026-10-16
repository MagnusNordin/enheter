import { render, screen, within } from '@testing-library/react';
import { FAMILIES } from '../../domain/families.ts';
import type { Question } from '../../domain/question.ts';
import { UnitLadder } from './UnitLadder.tsx';

const NBSP = ' ';
const dlToL: Question = { value: 40, from: 'dl', to: 'l', answer: 4, step: 0, down: false };
const hgToG: Question = { value: 20, from: 'hg', to: 'g', answer: 2000, step: 1, down: true };

type Props = Parameters<typeof UnitLadder>[0];

function setup(overrides: Partial<Props> = {}) {
  const props: Props = {
    family: FAMILIES.liter,
    question: dlToL,
    showFactors: true,
    compact: false,
    ...overrides,
  };
  return render(<UnitLadder {...props} />);
}

const items = () => within(screen.getByRole('list')).getAllByRole('listitem');
const steps = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLElement>('li[data-active]'),
];

describe('UnitLadder', () => {
  it('has a heading', () => {
    setup();
    expect(
      screen.getByRole('heading', { name: 'Enhetsstegen · från störst till minst' }),
    ).toBeInTheDocument();
  });

  it('uses a shorter heading on compact screens', () => {
    setup({ compact: true });
    expect(
      screen.getByRole('heading', { name: 'Enhetsstegen · störst till minst' }),
    ).toBeInTheDocument();
  });

  it('lists all units with the steps between them', () => {
    setup();
    expect(items()).toHaveLength(7);
    expect(items().map((li) => li.textContent)).toEqual([
      'ltill',
      '← ÷10',
      'dlfrån',
      '×10',
      'cl',
      '×10',
      'ml',
    ]);
  });

  it('marks the from and to units', () => {
    const { container } = setup();
    const roles = [...container.querySelectorAll('li[data-role]')].map((li) =>
      li.getAttribute('data-role'),
    );
    expect(roles).toEqual(['to', 'from', 'none', 'none']);
  });

  it('marks only the step this question crosses', () => {
    const { container } = setup({ family: FAMILIES.gram, question: hgToG });
    expect(steps(container).map((s) => s.dataset.active)).toEqual(['false', 'true', 'false']);
    expect(steps(container)[1]).toHaveTextContent('×100 →');
  });

  it('formats ×1000 the Swedish way', () => {
    setup({
      family: FAMILIES.meter,
      question: { value: 10, from: 'km', to: 'm', answer: 10000, step: 0, down: true },
    });
    // Testing Library normalizes the non-breaking space to a plain one.
    expect(screen.getByText('×1 000 →').textContent).toBe(`×1${NBSP}000 →`);
  });

  it('hides the factors when turned off', () => {
    setup({ showFactors: false });
    expect(screen.queryByText(/×|÷/)).not.toBeInTheDocument();
  });

  it('draws an arrowhead instead of an arrow character on compact screens', () => {
    const up = setup({ compact: true });
    expect(screen.getByText('÷10')).toBeInTheDocument();
    expect(up.container.querySelector('[data-direction="left"]')).toBeInTheDocument();
    expect(up.container.querySelector('[data-direction="right"]')).toBeNull();
    up.unmount();

    const down = setup({ compact: true, family: FAMILIES.gram, question: hgToG });
    expect(screen.getByText('×100')).toBeInTheDocument();
    expect(down.container.querySelector('[data-direction="right"]')).toBeInTheDocument();
    expect(down.container.querySelector('[data-direction="left"]')).toBeNull();
  });

  it('draws no arrowheads on wide screens', () => {
    const { container } = setup();
    expect(container.querySelector('[data-direction]')).toBeNull();
  });
});
