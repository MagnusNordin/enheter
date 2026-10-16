import { render, screen } from '@testing-library/react';
import App from './App.tsx';

describe('App', () => {
  it('shows the app heading', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Träning för olika enheter' }),
    ).toBeInTheDocument();
  });
});
