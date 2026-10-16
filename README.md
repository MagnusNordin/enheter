# Enheter

**Träning för olika enheter** – en övningsapp för att räkna om mellan enheter för vikt (g), längd (m) och volym (l).

A Swedish practice app for converting metric units: pick gram, meter or liter, answer a round of questions like `40 dl = ? l`, and see your score.

**Live:** https://magnusnordin.github.io/enheter/

## Så fungerar det / How it works

1. **Välj enhet** – gram (kg, hg, g, mg), meter (km, m, dm, cm, mm) or liter (l, dl, cl, ml).
2. **Räkna om** – each question converts 10–80 of one unit to the unit next to it, for example `40 dl = [ ] l`. Decimal answers use a comma (`0,5`); a point also works. Press **rätta** (or Enter) to check and **nästa** to go on.
3. **Resultat** – the score, one square per question, and **klar** back to the start.

Also:

- **Enhetsstegen** (the unit ladder) under each question shows all units in the family, which one you convert _från_ and _till_, and the factor for that step.
- **Inställningar** (the button on the start screen): questions per round (3–60, default 30), and switches for the ladder and its factors.
- **Results are remembered** on each start card: `Bäst 28/30 · Senast 24/30`. Settings and results are stored in the browser's `localStorage` only; the app has no server and no tracking.

Designed for desktop (1024×768) and phone (390×844) in Claude Design; tablets get the desktop layout scaled to fit.

Unit factors match the original app's data: gram steps are ×10 (kg→hg), ×100 (hg→g) and ×1000 (g→mg).

## Development

Requires Node 24 (see `.nvmrc`).

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:5173/enheter/.

| Script                  | What it does                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| `npm run dev`           | Start the Vite dev server                                           |
| `npm run build`         | Typecheck and build to `dist/`                                      |
| `npm run preview`       | Serve the built app                                                 |
| `npm run lint`          | ESLint (with jsx-a11y)                                              |
| `npm run format`        | Prettier (write); `format:check` to check only                      |
| `npm run typecheck`     | TypeScript project check                                            |
| `npm test`              | Unit tests (Vitest + React Testing Library)                         |
| `npm run test:watch`    | Unit tests in watch mode                                            |
| `npm run test:coverage` | Unit tests with coverage thresholds (95% lines, 90% branches)       |
| `npm run test:e2e`      | Playwright end-to-end tests on desktop, tablet and mobile viewports |

Before the first e2e run, install the browser:

```bash
npx playwright install chromium
```

## Tests

- **Unit tests** (`src/**/*.test.ts(x)`): the game rules in `src/domain` (checked against the old app's unit data), the quiz reducer, storage, hooks and every component. Each screen and state also gets an automated [axe](https://github.com/dequelabs/axe-core) accessibility check.
- **End-to-end tests** (`e2e/`): full rounds per unit family with answers read off the page, settings that survive a reload, keyboard-only play, layout at three viewport sizes (no sideways scrolling, even for the widest question), and axe with colour contrast in a real browser.

## Project structure

```
src/
├── domain/       game rules as pure functions: unit families, questions,
│                 number parsing/formatting, ladder and ruler view models
├── state/        quiz reducer (start → quiz → result)
├── storage/      guarded localStorage for settings and results
├── hooks/        useQuiz, useSettings, useResults, useMediaQuery
├── components/   StartScreen, SettingsDialog, QuizScreen, ResultScreen
├── styles/       design tokens, family colours, global styles
└── test/         test setup and helpers
e2e/              Playwright specs and helpers
docs/PLAN.md      implementation plan
```

## Deployment

Every push to `main` runs CI (lint, format, typecheck, unit tests with coverage, build, e2e). When CI passes, the **Deploy to GitHub Pages** workflow builds the app and publishes `dist/` to https://magnusnordin.github.io/enheter/.

## Stack

Vite, React, TypeScript, CSS Modules, Vitest, React Testing Library, axe-core, Playwright. Fonts (Atkinson Hyperlegible and Bricolage Grotesque) are self-hosted via Fontsource.

This replaces an older AngularJS version of the app.

## License

MIT
