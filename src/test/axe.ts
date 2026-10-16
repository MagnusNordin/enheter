import axe from 'axe-core';

/**
 * Runs axe on a rendered tree and fails with a readable list of violations.
 * Colour contrast needs real layout, so it is checked in the Playwright suite.
 */
export async function expectNoAxeViolations(container: Element) {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  const violations = results.violations.map(
    (v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  );
  expect(violations, `axe violations:\n${violations.join('\n')}`).toEqual([]);
}
