import { useCallback, useState } from 'react';
import styles from './App.module.css';
import { SettingsDialog } from './components/SettingsDialog/SettingsDialog.tsx';
import { StartScreen } from './components/StartScreen/StartScreen.tsx';
import type { Rng } from './domain/random.ts';
import { useQuiz, type RoundSummary } from './hooks/useQuiz.ts';
import { useResults } from './hooks/useResults.ts';
import { useSettings } from './hooks/useSettings.ts';

interface AppProps {
  /** Seeded rng for tests; defaults to Math.random. */
  rng?: Rng;
}

export default function App({ rng }: AppProps) {
  const { settings, updateSettings } = useSettings();
  const { results, record } = useResults();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const onRoundComplete = useCallback(
    ({ family, score, total }: RoundSummary) => record(family, score, total),
    [record],
  );
  const quiz = useQuiz({ rng, onRoundComplete });

  if (quiz.state.screen !== 'start') {
    // Temporary until the quiz and result screens land (phases 6–7).
    return (
      <main className={styles.placeholder}>
        <h1 className={styles.placeholderTitle}>Övningen kommer snart</h1>
        <button type="button" className={styles.placeholderButton} onClick={quiz.exit}>
          Avsluta
        </button>
      </main>
    );
  }

  return (
    <>
      <StartScreen
        questions={settings.questions}
        results={results}
        onPick={(family) => quiz.start(family, settings.questions)}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        onChange={updateSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
