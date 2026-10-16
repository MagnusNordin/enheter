import { FAMILIES, FAMILY_KEYS, type FamilyKey } from '../../domain/families.ts';
import type { Results } from '../../storage/results.ts';
import { SettingsIcon } from '../icons.tsx';
import styles from './StartScreen.module.css';
import { UnitCard } from './UnitCard.tsx';

interface StartScreenProps {
  questions: number;
  results: Results;
  onPick: (family: FamilyKey) => void;
  onOpenSettings: () => void;
}

export function StartScreen({ questions, results, onPick, onOpenSettings }: StartScreenProps) {
  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <div className={styles.intro}>
          <p className={styles.kicker}>Enheter</p>
          <h1 className={styles.title}>Träning för olika enheter</h1>
          <p className={styles.lead}>Välj vad du vill öva på.</p>
        </div>
        <button
          type="button"
          className={styles.settings}
          onClick={onOpenSettings}
          aria-label="Inställningar"
          aria-haspopup="dialog"
        >
          <SettingsIcon size={22} />
        </button>
      </header>

      <div className={styles.cards}>
        {FAMILY_KEYS.map((key) => (
          <UnitCard
            key={key}
            family={FAMILIES[key]}
            results={results[key]}
            onPick={() => onPick(key)}
          />
        ))}
      </div>

      <p className={styles.footer}>
        {questions} tal per runda. Du räknar alltid om till enheten bredvid.
      </p>
    </main>
  );
}
