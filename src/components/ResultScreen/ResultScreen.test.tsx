import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultScreen } from './ResultScreen.tsx';

const history = Array.from({ length: 30 }, (_, i) => ![3, 8, 11, 17, 22, 27].includes(i));

function setup(onDone = vi.fn()) {
  render(<ResultScreen family="liter" score={24} total={30} history={history} onDone={onDone} />);
  return onDone;
}

describe('ResultScreen', () => {
  it('shows the score as the main heading', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: '24/30' })).toBeInTheDocument();
  });

  it('names the family and spells out the result', () => {
    setup();
    expect(screen.getByText('Resultat · liter')).toBeInTheDocument();
    expect(screen.getByText('Du fick 24 rätt av 30 tal.')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('data-family', 'liter');
  });

  it('shows one square per question', () => {
    setup();
    expect(screen.getAllByRole('listitem')).toHaveLength(30);
    expect(screen.getAllByText(/: fel$/)).toHaveLength(6);
  });

  it('moves focus to the score', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
  });

  it('goes back with klar', async () => {
    const onDone = setup();
    await userEvent.click(screen.getByRole('button', { name: 'klar' }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('shows a perfect and an empty round', () => {
    const { unmount } = render(
      <ResultScreen
        family="gram"
        score={3}
        total={3}
        history={[true, true, true]}
        onDone={() => {}}
      />,
    );
    expect(screen.getByRole('heading', { name: '3/3' })).toBeInTheDocument();
    unmount();
    render(
      <ResultScreen
        family="meter"
        score={0}
        total={3}
        history={[false, false, false]}
        onDone={() => {}}
      />,
    );
    expect(screen.getByText('Du fick 0 rätt av 3 tal.')).toBeInTheDocument();
  });
});
