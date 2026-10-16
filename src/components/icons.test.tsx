import { render } from '@testing-library/react';
import {
  ArrowRightIcon,
  CheckIcon,
  CloseIcon,
  MinusIcon,
  PlusIcon,
  SettingsIcon,
} from './icons.tsx';

describe('icons', () => {
  it.each([
    ['ArrowRightIcon', ArrowRightIcon],
    ['CheckIcon', CheckIcon],
    ['CloseIcon', CloseIcon],
    ['MinusIcon', MinusIcon],
    ['PlusIcon', PlusIcon],
    ['SettingsIcon', SettingsIcon],
  ])('%s is a decorative stroke svg', (_, Icon) => {
    const { container } = render(<Icon size={32} strokeWidth={3} className="x" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('stroke-width', '3');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveClass('x');
  });

  it('defaults to 20px', () => {
    const { container } = render(<CheckIcon />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '20');
  });
});
