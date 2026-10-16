import { render, screen, within } from '@testing-library/react';
import { HistoryGrid } from './HistoryGrid.tsx';

describe('HistoryGrid', () => {
  it('has one square per question in order', () => {
    render(<HistoryGrid history={[true, false, true, true]} />);
    const list = screen.getByRole('list', { name: 'Svar per tal' });
    const squares = within(list).getAllByRole('listitem');
    expect(squares.map((s) => s.getAttribute('data-result'))).toEqual([
      'correct',
      'wrong',
      'correct',
      'correct',
    ]);
  });

  it('describes each question for screen readers', () => {
    render(<HistoryGrid history={[true, false]} />);
    expect(screen.getAllByRole('listitem').map((s) => s.textContent)).toEqual([
      'Tal 1: rätt',
      'Tal 2: fel',
    ]);
  });

  it('shows a legend that screen readers skip', () => {
    const { container } = render(<HistoryGrid history={[true]} />);
    const legend = container.querySelector('[aria-hidden="true"]')!;
    expect(legend).toHaveTextContent('rätt');
    expect(legend).toHaveTextContent('fel');
  });

  it('handles a long round', () => {
    render(<HistoryGrid history={Array.from({ length: 60 }, (_, i) => i % 3 !== 0)} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(60);
  });
});
