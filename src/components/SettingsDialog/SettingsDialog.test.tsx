import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { DEFAULT_SETTINGS, normalizeSettings, type Settings } from '../../storage/settings.ts';
import { SettingsDialog } from './SettingsDialog.tsx';

/** Renders the dialog with real state so changes show up like in the app. */
function setup(initial: Partial<Settings> = {}, startOpen = true) {
  const onChange = vi.fn();
  const onClose = vi.fn();

  function Harness() {
    const [settings, setSettings] = useState<Settings>({ ...DEFAULT_SETTINGS, ...initial });
    const [open, setOpen] = useState(startOpen);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          öppna
        </button>
        <output data-testid="settings">{JSON.stringify(settings)}</output>
        <SettingsDialog
          open={open}
          settings={settings}
          onChange={(patch) => {
            onChange(patch);
            setSettings((s) => normalizeSettings({ ...s, ...patch }));
          }}
          onClose={() => {
            onClose();
            setOpen(false);
          }}
        />
      </>
    );
  }

  render(<Harness />);
  const current = () => JSON.parse(screen.getByTestId('settings').textContent ?? '{}') as Settings;
  const dialog = () => screen.getByRole('dialog', { hidden: true });
  const count = () => screen.getByRole('textbox', { name: 'Tal per runda', hidden: true });
  return { onChange, onClose, current, dialog, count };
}

describe('SettingsDialog', () => {
  it('opens as a labelled dialog', () => {
    const { dialog } = setup();
    expect(dialog()).toHaveAttribute('open');
    expect(screen.getByRole('dialog', { name: 'Inställningar' })).toBeInTheDocument();
  });

  it('stays closed until opened', async () => {
    const { dialog } = setup({}, false);
    expect(dialog()).not.toHaveAttribute('open');
    await userEvent.click(screen.getByRole('button', { name: 'öppna' }));
    expect(dialog()).toHaveAttribute('open');
  });

  it('shows the current settings', () => {
    const { count } = setup({ questions: 12, showLadder: true, showFactors: false });
    expect(count()).toHaveValue('12');
    expect(screen.getByRole('switch', { name: 'Visa enhetsstegen' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Visa faktorerna på stegen' })).not.toBeChecked();
  });

  it('changes the count with the + and − buttons', async () => {
    const { current, count } = setup({ questions: 10 });
    await userEvent.click(screen.getByRole('button', { name: 'Fler tal' }));
    await userEvent.click(screen.getByRole('button', { name: 'Fler tal' }));
    expect(current().questions).toBe(12);
    await userEvent.click(screen.getByRole('button', { name: 'Färre tal' }));
    expect(current().questions).toBe(11);
    expect(count()).toHaveValue('11');
  });

  it('disables − at the minimum and + at the maximum', () => {
    setup({ questions: 3 });
    expect(screen.getByRole('button', { name: 'Färre tal' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Fler tal' })).toBeEnabled();
  });

  it('disables + at the maximum', () => {
    setup({ questions: 60 });
    expect(screen.getByRole('button', { name: 'Fler tal' })).toBeDisabled();
  });

  it('lets the user type a count without clamping while typing', async () => {
    const { current, count, onChange } = setup();
    await userEvent.clear(count());
    await userEvent.type(count(), '1');
    expect(count()).toHaveValue('1');
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.type(count(), '5');
    await userEvent.tab();
    expect(current().questions).toBe(15);
  });

  it('clamps a typed count on blur', async () => {
    const { current, count } = setup();
    await userEvent.clear(count());
    await userEvent.type(count(), '99');
    await userEvent.tab();
    expect(current().questions).toBe(60);
    expect(count()).toHaveValue('60');
  });

  it('ignores a typed count that is not a number', async () => {
    const { current, count, onChange } = setup({ questions: 20 });
    await userEvent.clear(count());
    await userEvent.type(count(), 'tio');
    await userEvent.tab();
    expect(onChange).not.toHaveBeenCalled();
    expect(current().questions).toBe(20);
    expect(count()).toHaveValue('20');
  });

  it('steps from a typed count', async () => {
    const { current, count } = setup({ questions: 20 });
    await userEvent.clear(count());
    await userEvent.type(count(), '40');
    await userEvent.click(screen.getByRole('button', { name: 'Fler tal' }));
    expect(current().questions).toBe(41);
  });

  it('steps from the saved count when the typed text is invalid', async () => {
    const { current, count } = setup({ questions: 20 });
    await userEvent.clear(count());
    await userEvent.type(count(), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Färre tal' }));
    expect(current().questions).toBe(19);
  });

  it('toggles the ladder and the factors', async () => {
    const { current } = setup();
    await userEvent.click(screen.getByRole('switch', { name: 'Visa faktorerna på stegen' }));
    expect(current().showFactors).toBe(false);
    await userEvent.click(screen.getByRole('switch', { name: 'Visa enhetsstegen' }));
    expect(current().showLadder).toBe(false);
  });

  it('disables the factors switch while the ladder is hidden', () => {
    setup({ showLadder: false });
    expect(screen.getByRole('switch', { name: 'Visa faktorerna på stegen' })).toBeDisabled();
  });

  it('closes with Klar and saves a typed count', async () => {
    const { current, count, onClose, dialog } = setup();
    await userEvent.clear(count());
    await userEvent.type(count(), '8');
    fireEvent.click(screen.getByRole('button', { name: 'Klar' }));
    expect(current().questions).toBe(8);
    expect(onClose).toHaveBeenCalled();
    expect(dialog()).not.toHaveAttribute('open');
  });

  it('closes with Enter in the count field', async () => {
    const { current, count, onClose } = setup();
    await userEvent.clear(count());
    await userEvent.type(count(), '25{Enter}');
    expect(current().questions).toBe(25);
    expect(onClose).toHaveBeenCalled();
  });

  it('closes with the close button', async () => {
    const { onClose, dialog } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Stäng' }));
    expect(onClose).toHaveBeenCalled();
    expect(dialog()).not.toHaveAttribute('open');
  });

  it('closes with Escape and keeps a typed count', async () => {
    const { current, count, onClose, dialog } = setup();
    await userEvent.clear(count());
    await userEvent.type(count(), '7');
    const cancel = new Event('cancel', { cancelable: true });
    fireEvent(dialog(), cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(current().questions).toBe(7);
    expect(onClose).toHaveBeenCalled();
    expect(dialog()).not.toHaveAttribute('open');
  });

  it('reports a close made by the browser', () => {
    const { onClose, dialog } = setup();
    (dialog() as HTMLDialogElement).close();
    expect(onClose).toHaveBeenCalled();
  });
});
