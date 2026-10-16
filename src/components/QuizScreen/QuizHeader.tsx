import type { Family } from '../../domain/families.ts';
import { CloseIcon } from '../icons.tsx';
import styles from './QuizHeader.module.css';

interface QuizHeaderProps {
  family: Family;
  index: number;
  total: number;
  onExit: () => void;
}

export function QuizHeader({ family, index, total, onExit }: QuizHeaderProps) {
  return (
    <div className={styles.header}>
      <button type="button" className={styles.exit} onClick={onExit}>
        <CloseIcon size={18} />
        <span className={styles.exitText}>Avsluta</span>
      </button>
      <p className={styles.badge}>
        <span className={styles.symbol} aria-hidden="true">
          {family.symbol}
        </span>
        <span>{family.name}</span>
        <span className={styles.kind}>· {family.kind.toLowerCase()}</span>
      </p>
      <p className={styles.progress}>
        Tal {index + 1} av {total}
      </p>
    </div>
  );
}
