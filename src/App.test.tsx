import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.tsx';
import { mulberry32 } from './domain/random.ts';
import { RESULTS_KEY } from './storage/results.ts';
import { SETTINGS_KEY } from './storage/settings.ts';

function renderApp() {
  return render(<App rng={mulberry32(1)} />);
}

describe('App', () => {
  it('opens on the start screen', () => {
    renderApp();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Träning för olika enheter' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^30 tal per runda/)).toBeInTheDocument();
  });

  it('uses stored settings and results', () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ questions: 10, showLadder: true, showFactors: true }),
    );
    localStorage.setItem(
      RESULTS_KEY,
      JSON.stringify({
        gram: {
          best: { score: 9, total: 10, at: '2026-10-16T12:00:00.000Z' },
          last: { score: 7, total: 10, at: '2026-10-17T12:00:00.000Z' },
        },
      }),
    );
    renderApp();
    expect(screen.getByText(/^10 tal per runda/)).toBeInTheDocument();
    expect(screen.getByText('Bäst 9/10 · Senast 7/10')).toBeInTheDocument();
  });

  it('changes the round length in settings and remembers it', async () => {
    renderApp();
    await userEvent.click(screen.getByRole('button', { name: 'Inställningar' }));
    const dialog = screen.getByRole('dialog', { name: 'Inställningar' });
    expect(dialog).toHaveAttribute('open');

    await userEvent.click(screen.getByRole('button', { name: 'Färre tal' }));
    await userEvent.click(screen.getByRole('button', { name: 'Klar' }));

    expect(dialog).not.toHaveAttribute('open');
    expect(screen.getByText(/^29 tal per runda/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(SETTINGS_KEY)!)).toMatchObject({ questions: 29 });
  });

  it('starts a round from a card and can leave it', async () => {
    renderApp();
    await userEvent.click(screen.getByRole('button', { name: /^Öva på liter/ }));
    expect(screen.queryByRole('heading', { name: 'Träning för olika enheter' })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Avsluta' }));
    expect(
      screen.getByRole('heading', { level: 1, name: 'Träning för olika enheter' }),
    ).toBeInTheDocument();
  });
});
