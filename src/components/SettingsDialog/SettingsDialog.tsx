import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import {
  clampQuestions,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  type Settings,
} from '../../storage/settings.ts';
import { CloseIcon, MinusIcon, PlusIcon } from '../icons.tsx';
import styles from './SettingsDialog.module.css';

interface SettingsDialogProps {
  open: boolean;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

export function SettingsDialog({ open, settings, onChange, onClose }: SettingsDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const questionsId = useId();
  const questionsHintId = useId();
  const factorsHintId = useId();
  // What the user is typing in the count field; null shows the saved value.
  // Only committed on blur, Enter or close, so "15" isn't clamped at "1".
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const commitDraft = () => {
    if (draft === null) return;
    if (/^\d+$/.test(draft.trim())) onChange({ questions: clampQuestions(Number(draft)) });
    setDraft(null);
  };

  const requestClose = () => {
    commitDraft();
    onClose();
  };

  const step = (delta: number) => {
    const current =
      draft !== null && /^\d+$/.test(draft.trim()) ? Number(draft) : settings.questions;
    onChange({ questions: clampQuestions(current + delta) });
    setDraft(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    requestClose();
  };

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClose={onClose}
    >
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            Inställningar
          </h2>
          <button
            type="button"
            className={styles.iconButton}
            onClick={requestClose}
            aria-label="Stäng"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className={styles.field}>
          <label htmlFor={questionsId} className={styles.label}>
            Tal per runda
          </label>
          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => step(-1)}
              disabled={settings.questions <= MIN_QUESTIONS}
              aria-label="Färre tal"
            >
              <MinusIcon size={18} />
            </button>
            <input
              id={questionsId}
              className={styles.count}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-describedby={questionsHintId}
              value={draft ?? String(settings.questions)}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={commitDraft}
            />
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => step(1)}
              disabled={settings.questions >= MAX_QUESTIONS}
              aria-label="Fler tal"
            >
              <PlusIcon size={18} />
            </button>
          </div>
          <p id={questionsHintId} className={styles.hint}>
            Från {MIN_QUESTIONS} till {MAX_QUESTIONS} tal.
          </p>
        </div>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            role="switch"
            className={styles.switch}
            checked={settings.showLadder}
            onChange={(event) => onChange({ showLadder: event.target.checked })}
          />
          <span className={styles.label}>Visa enhetsstegen</span>
        </label>

        <div className={styles.field}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              role="switch"
              className={styles.switch}
              checked={settings.showFactors}
              disabled={!settings.showLadder}
              aria-describedby={factorsHintId}
              onChange={(event) => onChange({ showFactors: event.target.checked })}
            />
            <span className={styles.label}>Visa faktorerna på stegen</span>
          </label>
          <p id={factorsHintId} className={styles.hint}>
            Till exempel ×10 mellan dl och cl.
          </p>
        </div>

        <button type="submit" className={styles.done}>
          Klar
        </button>
      </form>
    </dialog>
  );
}
