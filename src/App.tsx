import styles from './App.module.css';

// Placeholder until the start screen lands in phase 5.
export default function App() {
  return (
    <main className={styles.page}>
      <p className={styles.kicker}>Enheter</p>
      <h1 className={styles.title}>Träning för olika enheter</h1>
      <p className={styles.lead}>Snart kan du öva på gram, meter och liter här.</p>
    </main>
  );
}
