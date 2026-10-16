import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { emptyResults, recordResult } from '../../storage/results.ts';
import { StartScreen } from './StartScreen.tsx';

function setup(overrides: Partial<Parameters<typeof StartScreen>[0]> = {}) {
  const props = {
    questions: 30,
    results: emptyResults(),
    onPick: vi.fn(),
    onOpenSettings: vi.fn(),
    ...overrides,
  };
  render(<StartScreen {...props} />);
  return props;
}

describe('StartScreen', () => {
  it('shows the heading and intro', () => {
    setup();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Träning för olika enheter' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Välj vad du vill öva på.')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('shows gram, meter and liter in order', () => {
    setup();
    const cards = screen.getAllByRole('button', { name: /Öva$/ });
    expect(cards.map((c) => c.getAttribute('data-family'))).toEqual(['gram', 'meter', 'liter']);
  });

  it.each(['gram', 'meter', 'liter'] as const)('starts %s when its card is picked', async (key) => {
    const { onPick } = setup();
    await userEvent.click(screen.getByRole('button', { name: new RegExp(`\\b${key}\\b`) }));
    expect(onPick).toHaveBeenCalledWith(key);
  });

  it('shows the number of questions per round', () => {
    setup({ questions: 12 });
    expect(
      screen.getByText('12 tal per runda. Du räknar alltid om till enheten bredvid.'),
    ).toBeInTheDocument();
  });

  it('shows stored results on the right card only', () => {
    const results = recordResult(emptyResults(), 'liter', {
      score: 2,
      total: 3,
      at: '2026-10-16T12:00:00.000Z',
    });
    setup({ results });
    const liter = screen.getByRole('button', { name: /\bliter\b/ });
    expect(within(liter).getByText('Bäst 2/3 · Senast 2/3')).toBeInTheDocument();
    expect(screen.getAllByText(/Bäst/)).toHaveLength(1);
  });

  it('opens settings from the settings button', async () => {
    const { onOpenSettings } = setup();
    const button = screen.getByRole('button', { name: 'Inställningar' });
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    await userEvent.click(button);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
