import { isRecord, loadJson, saveJson } from './storage.ts';

export interface Settings {
  /** Questions per round. */
  questions: number;
  /** Show the unit ladder ("Enhetsstegen") under the question. */
  showLadder: boolean;
  /** Show the ×10 factors on the ladder. */
  showFactors: boolean;
}

export const SETTINGS_KEY = 'enheter:v1:settings';
export const MIN_QUESTIONS = 3;
export const MAX_QUESTIONS = 60;

export const DEFAULT_SETTINGS: Readonly<Settings> = {
  questions: 30,
  showLadder: true,
  showFactors: true,
};

export function clampQuestions(n: number): number {
  return Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, Math.round(n)));
}

/** Keeps each valid field and falls back to the default for the rest. */
export function normalizeSettings(raw: unknown): Settings {
  const source = isRecord(raw) ? raw : {};
  const { questions, showLadder, showFactors } = source;
  return {
    questions:
      typeof questions === 'number' && Number.isFinite(questions)
        ? clampQuestions(questions)
        : DEFAULT_SETTINGS.questions,
    showLadder: typeof showLadder === 'boolean' ? showLadder : DEFAULT_SETTINGS.showLadder,
    showFactors: typeof showFactors === 'boolean' ? showFactors : DEFAULT_SETTINGS.showFactors,
  };
}

export function loadSettings(): Settings {
  return normalizeSettings(loadJson(SETTINGS_KEY));
}

export function saveSettings(settings: Settings): boolean {
  return saveJson(SETTINGS_KEY, settings);
}
