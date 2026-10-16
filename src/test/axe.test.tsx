import { render } from '@testing-library/react';
import { expectNoAxeViolations } from './axe.ts';

describe('expectNoAxeViolations (test helper)', () => {
  it('passes accessible markup', async () => {
    const { container } = render(<button type="button">OK</button>);
    await expectNoAxeViolations(container);
  });

  it('fails on a real violation', async () => {
    const { container } = render(<button type="button" />);
    await expect(expectNoAxeViolations(container)).rejects.toThrow(/button-name/);
  });
});
