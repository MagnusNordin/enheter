import { useCallback, useState } from 'react';
import { QuizScreen } from './components/QuizScreen/QuizScreen.tsx';
import { ResultScreen } from './components/ResultScreen/ResultScreen.tsx';
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

  if (quiz.state.screen === 'quiz') {
    return (
      <QuizScreen
        state={quiz.state}
        settings={settings}
        onInput={quiz.setInput}
        onCheck={quiz.check}
        onNext={quiz.next}
        onExit={quiz.exit}
      />
    );
  }

  if (quiz.state.screen === 'result' && quiz.state.family) {
    return (
      <ResultScreen
        family={quiz.state.family}
        score={quiz.state.score}
        total={quiz.state.total}
        history={quiz.state.history}
        onDone={quiz.exit}
      />
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
