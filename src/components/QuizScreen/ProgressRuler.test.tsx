import { render, screen } from '@testing-library/react';
import { ProgressRuler } from './ProgressRuler.tsx';

function ticks() {
  return [...screen.getByTestId('ruler').querySelectorAll<HTMLElement>('[data-state]')];
}

describe('ProgressRuler', () => {
  it('is hidden from screen readers', () => {
    render(<ProgressRuler total={30} index={0} checked={false} compact={false} />);
    expect(screen.getByTestId('ruler')).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws one tick per question plus zero', () => {
    render(<ProgressRuler total={30} index={0} checked={false} compact={false} />);
    expect(ticks()).toHaveLength(31);
  });

  it('marks done, current and pending ticks', () => {
    render(<ProgressRuler total={10} index={2} checked={false} compact={false} />);
    expect(ticks().map((t) => t.dataset.state)).toEqual([
      'done',
      'done',
      'done',
      'current',
      'pending',
      'pending',
      'pending',
      'pending',
      'pending',
      'pending',
      'pending',
    ]);
  });

  it('labels every 5th tick on wide screens', () => {
    render(<ProgressRuler total={40} index={0} checked={true} compact={false} />);
    const labels = [...screen.getByTestId('ruler').querySelectorAll('span')].map(
      (s) => s.textContent,
    );
    expect(labels).toEqual(['0', '5', '10', '15', '20', '25', '30', '35', '40']);
  });

  it('labels every 10th tick on compact screens with long rounds', () => {
    render(<ProgressRuler total={40} index={0} checked={true} compact={true} />);
    const labels = [...screen.getByTestId('ruler').querySelectorAll('span')].map(
      (s) => s.textContent,
    );
    expect(labels).toEqual(['0', '10', '20', '30', '40']);
  });

  it('marks major ticks', () => {
    render(<ProgressRuler total={10} index={0} checked={true} compact={false} />);
    expect(ticks().filter((t) => t.dataset.major === 'true')).toHaveLength(3);
  });
});
