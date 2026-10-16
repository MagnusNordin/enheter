import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.tsx';
import { mulberry32 } from './domain/random.ts';
import { RESULTS_KEY } from './storage/results.ts';
import { SETTINGS_KEY } from './storage/settings.ts';
import { solveOnScreen } from './test/solve.ts';

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

  it('plays a whole round and remembers the score', async () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ questions: 3, showLadder: true, showFactors: true }),
    );
    renderApp();
    await userEvent.click(screen.getByRole('button', { name: /^Öva på liter/ }));

    for (const [i, right] of [true, false, true].entries()) {
      expect(screen.getByText(`Tal ${i + 1} av 3`)).toBeInTheDocument();
      const answer = solveOnScreen();
      const input = screen.getByRole('textbox', { name: /^Svar i / });
      expect(input).toHaveFocus();
      await userEvent.type(input, String(right ? answer : answer * 10).replace('.', ','));
      await userEvent.keyboard('{Enter}');
      expect(screen.getByRole('status')).toHaveTextContent(right ? 'Rätt!' : /^Fel!/);
      await userEvent.keyboard('{Enter}');
    }

    expect(screen.getByRole('heading', { level: 1, name: '2/3' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'klar' }));

    expect(screen.getByText('Bäst 2/3 · Senast 2/3')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(RESULTS_KEY)!).liter.last).toMatchObject({
      score: 2,
      total: 3,
    });
  });
});
