import { render, screen } from '@testing-library/react';
import { Feedback } from './Feedback.tsx';

describe('Feedback', () => {
  it('shows RÄTT! without the answer when right', () => {
    const { container } = render(<Feedback correct={true} answerText="4 l" />);
    expect(screen.getByText('RÄTT!')).toBeInTheDocument();
    expect(screen.queryByText(/Rätt svar/)).not.toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute('data-result', 'correct');
  });

  it('shows FEL! and the right answer when wrong', () => {
    const { container } = render(<Feedback correct={false} answerText="0,08 km" />);
    expect(screen.getByText('FEL!')).toBeInTheDocument();
    expect(screen.getByText(/Rätt svar:/)).toHaveTextContent('Rätt svar: 0,08 km');
    expect(screen.getByText('0,08 km').tagName).toBe('STRONG');
    expect(container.firstChild).toHaveAttribute('data-result', 'wrong');
  });

  it('uses a different icon for right and wrong, not just colour', () => {
    const right = render(<Feedback correct={true} answerText="4 l" />);
    const rightPath = right.container.querySelector('path')!.getAttribute('d');
    right.unmount();
    const wrong = render(<Feedback correct={false} answerText="4 l" />);
    const wrongPath = wrong.container.querySelector('path')!.getAttribute('d');
    expect(rightPath).not.toBe(wrongPath);
  });
});
