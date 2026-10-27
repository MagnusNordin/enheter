# Enheter – implementation plan

A React rewrite of the old AngularJS app at `/Volumes/New Volume 1/source/enheter`, built to the Claude Design canvas "Enheter" (https://claude.ai/artifact/HWs7EjG4jMDz45x4z217Ld) and published on GitHub.

## 1. What the app does

A Swedish practice app for converting metric units.

1. **Start**: pick one of three unit families. Each card shows its units.
   - **gram** (Vikt): kg, hg, g, mg
   - **meter** (Längd): km, m, dm, cm, mm
   - **liter** (Volym): l, dl, cl, ml
2. **Quiz**: a round of N questions (default 15), for example `40 dl = [ ] l`. The user types an answer and presses **rätta**. The app shows **RÄTT!** or **FEL!** and, when wrong, the correct answer. Then **nästa**, or **klar** after the last question.
3. **Result**: score `24/30`, a row of squares (one per question, green = right, red outline = wrong), and **klar** to go back to start.

### Rules from the old code, kept

| Rule                                                                                               | Source                 |
| -------------------------------------------------------------------------------------------------- | ---------------------- |
| The units in each family and their order are the same as `units.json` + `parts.json`               | old `services/`        |
| A question always converts to the unit right next to it in the list (one step up or down)          | `numbers.service.js`   |
| The start value is 10, 20 … 80                                                                     | `(floor(rand*8)+1)*10` |
| 30 questions per round                                                                             | `numbers.service.js`   |
| Swedish copy: "Träning för olika enheter", "Tal X av Y", "rätta", "RÄTT!", "FEL!", "nästa", "klar" | templates              |

The design keeps these too. Step factors per family: gram `×10, ×100, ×1000` (hg→g skips dag, g→mg skips dg/cg, as in the old data; the design prototype wrongly used ×10 for hg→g), meter `×1000, ×10, ×10, ×10`, liter `×10, ×10, ×10`.

### Old bugs, not carried over

- `parseInt` rejected decimal answers, so half the "up" questions (e.g. 10 g → hg = 0,1) could never be answered correctly.
- The boundary check hard-coded index `5` instead of the list length.
- `units.json`/`parts.json` were not valid JSON, routes used `gram`/`meter`/`liter` while the data used `g`/`m`/`l`, and the quiz and result routes were commented out. The app never fully worked.

### New in this version (from the design or your choices)

- **Decimal answers** with comma or point: `0,5`, `0.5`, `,5`; spaces allowed as thousands separators (`80 000`). Answers are shown in Swedish format.
- **Progress ruler**: the yellow "folding rule" strip with one tick per question.
- **Unit ladder (Enhetsstegen)**: all units in the family, _från_ and _till_ highlighted, and the active step's factor with direction (`×10 →` / `← ÷10`).
- **Avsluta** button during a round goes back to start without saving.
- **Settings** (gear button on start screen): questions per round (3–60), show ladder, show factors. Saved in localStorage.
- **Remembered results** on each start card: `Bäst 28/30 · Senast 24/30`. Saved in localStorage.

## 2. Stack

| Concern     | Choice                                                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Build       | Vite 7 + React 19 + TypeScript (strict)                                                                                       |
| Styling     | CSS Modules + one `tokens.css` with the design's colors, radii and type scale                                                 |
| Fonts       | DM Sans (body) and Anton (display), matching the Cutie Poppers shop, self-hosted via `@fontsource` packages, so no Google CDN call |
| State       | `useReducer` for the quiz; no router, one `screen` field (`start` / `quiz` / `result`)                                        |
| Unit tests  | Vitest + jsdom + React Testing Library + `@testing-library/user-event`, coverage with `@vitest/coverage-v8`                   |
| E2E         | Playwright, Chromium desktop (1024×768) and mobile (390×844)                                                                  |
| Lint/format | ESLint (typescript-eslint, react-hooks, jsx-a11y) + Prettier                                                                  |
| CI/CD       | GitHub Actions: CI on every push/PR, deploy `main` to GitHub Pages                                                            |

Node 24 (already installed). Exact versions get pinned in `package.json` at scaffold time.

## 3. Design tokens (from the canvas)

| Token                | Value                             | Use                                      |
| -------------------- | --------------------------------- | ---------------------------------------- |
| `--bg`               | `#F6F4EE`                         | page                                     |
| `--ink`              | `#17203A`                         | text, primary buttons                    |
| `--muted`            | `#4A5168`                         | secondary text                           |
| `--line`             | `#D9D6CC` / `#E4E1D8` / `#C9C5B8` | borders, dividers, inactive ladder lines |
| `--ruler`            | `#F2C230`                         | progress ruler                           |
| `--ok` / `--ok-bg`   | `#1E7F4F` / `#E2F4EA`             | correct                                  |
| `--bad` / `--bad-bg` | `#B5321F` / `#FCE3DD`             | wrong                                    |
| gram tint/deep       | `#FCE6D4` / `#8A420E`             |                                          |
| meter tint/deep      | `#DCE8FA` / `#1D4C91`             |                                          |
| liter tint/deep      | `#D3F1EA` / `#0B6553`             |                                          |

Radii: cards 28px (desktop) / 24px (mobile), pills 999px, input 24/20px. Touch targets at least 44px.

### Desktop vs. mobile

One responsive app with a breakpoint at **720px**:

| Screen       | Desktop (≥720px, designed at 1024×768)                            | Mobile (<720px, designed at 390×844)                          |
| ------------ | ----------------------------------------------------------------- | ------------------------------------------------------------- |
| Start        | 3 cards in a row, huge symbol, "Öva →" pill                       | 3 stacked rows, symbol left, round arrow button right         |
| Quiz header  | "× Avsluta" pill, family badge with kind ("· vikt"), "Tal X av Y" | icon-only × button (aria-label "Avsluta"), badge without kind |
| Question     | `40 dl = [input] l` on one line                                   | `40 dl =` above `[input] l`                                   |
| Feedback     | icon + word side by side with the nästa button                    | stacked, full-width button                                    |
| Ladder       | 76px chips, label "×10 →"                                         | 50px chips, label "×10" plus arrowhead on the line            |
| Result       | 15 squares per row                                                | 10 squares per row, full-width klar                           |
| Ruler labels | every 5th tick                                                    | every 5th, or every 10th when the round has more than 30      |

The design's `screen` / `questions` / `showLadder` / `showFactors` tweaks become real app state and settings.

## 4. Project structure

```
enheter/
├── .github/workflows/
│   ├── ci.yml              # lint, typecheck, unit tests + coverage, build, e2e
│   └── deploy.yml          # build + deploy to GitHub Pages on main
├── docs/PLAN.md
├── e2e/
│   ├── round.spec.ts       # full round, desktop + mobile
│   ├── settings.spec.ts
│   └── helpers.ts          # reads the question from the page, computes the answer with src/domain
├── public/favicon.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx             # picks the screen, wires settings + results
│   ├── domain/             # pure TypeScript, no React
│   │   ├── families.ts     # gram/meter/liter: units, step factors, colors, labels
│   │   ├── question.ts     # makeQuestion(family, rng, previous?)
│   │   ├── numbers.ts      # parseAnswer, formatNumber, isCorrect
│   │   ├── ladder.ts       # ladder view model (chips, connectors, active step)
│   │   ├── ruler.ts        # progress tick view model
│   │   └── random.ts       # Rng type, Math.random default, seeded mulberry32 for tests
│   ├── state/
│   │   └── quizReducer.ts  # screen, family, n, question, input, checked, correct, score, history
│   ├── storage/
│   │   ├── storage.ts      # safe JSON get/set (try/catch, quota, private mode)
│   │   ├── settings.ts     # load/validate/save settings
│   │   └── results.ts      # load/record best + last per family
│   ├── hooks/
│   │   ├── useSettings.ts
│   │   └── useResults.ts
│   ├── components/
│   │   ├── StartScreen/    # + UnitCard, SettingsButton
│   │   ├── SettingsDialog/ # native <dialog>
│   │   ├── QuizScreen/     # + QuizHeader, ProgressRuler, AnswerForm, Feedback, UnitLadder
│   │   ├── ResultScreen/   # + HistoryGrid
│   │   └── icons.tsx       # inline stroke SVGs: arrow, close, check, gear
│   └── styles/
│       ├── tokens.css
│       └── global.css
├── index.html              # lang="sv"
├── vite.config.ts          # base: '/enheter/'
├── vitest.config.ts
├── playwright.config.ts
├── eslint.config.js
├── .prettierrc
├── README.md
└── LICENSE                 # MIT
```

## 5. Core logic (domain layer)

All game rules live in `src/domain` as pure functions, so they get thorough unit tests without rendering anything.

**`makeQuestion(family, rng, previous?)`**

- `step = floor(rng() * (units.length - 1))`, `value = 10 * (1 + floor(rng() * 8))`, `down = rng() < 0.5`
- down: `from = units[step]`, `to = units[step+1]`, `answer = value × factor[step]`
- up: `from = units[step+1]`, `to = units[step]`, `answer = value ÷ factor[step]`
- Rounds the answer to 6 decimals to avoid float noise (`80 ÷ 1000 = 0.08`).
- Re-rolls if the question equals `previous`, so the same question never comes twice in a row.

**`parseAnswer(text)`**: strips spaces and non-breaking spaces, accepts `^\d+([.,]\d+)?$` or `^[.,]\d+$`, returns `number | null`. Negative numbers, letters, `1,2,3` and empty input return `null`.

**`isCorrect(given, expected)`**: relative tolerance `1e-9 × max(1, |expected|)`.

**`formatNumber(n)`**: `Intl.NumberFormat('sv-SE', { maximumFractionDigits: 6 })`, giving `0,08`, `80 000`.

**`quizReducer`** actions: `start(family)`, `input(text)`, `check()`, `next()` (goes to the result screen after the last question), `quit()`, `done()`. The reducer receives the RNG and the question count from outside, so it is deterministic in tests.

**Storage**: keys `enheter:v1:settings` and `enheter:v1:results`. Every read is validated (bad JSON, wrong shape, out-of-range values fall back to defaults); every write is wrapped in try/catch. A finished round records `last`, and replaces `best` if its ratio is higher (on a tie, the longer round wins). Quitting with Avsluta records nothing.

## 6. Accessibility and UX details

- `<html lang="sv">`; real `<button>`, `<form>`, `<label>`; Enter submits **rätta**, then **nästa**.
- The answer input gets focus on every new question, uses `inputMode="decimal"`, `autoComplete="off"` and `aria-label="Svar i l"`. It is read-only after checking.
- RÄTT!/FEL! in a `role="status"` region so screen readers announce it. Right and wrong also differ by icon and shape, not color alone.
- The ruler is `aria-hidden`; "Tal X av Y" is the readable progress.
- **rätta** is disabled until there is input.
- Settings dialog: native `<dialog>` with focus trap and Esc to close.
- `prefers-reduced-motion` respected for any transitions.

## 7. Unit test plan (Vitest + RTL)

Goal: every module in `src/` has a co-located `*.test.ts(x)`. Coverage threshold enforced in CI: **95% lines/functions/statements, 90% branches** (`main.tsx` excluded).

| File                                                                                                   | What is tested                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain/families.test.ts`                                                                              | each family has `factors.length === units.length - 1`; units and order match the old app's data; colors and labels exist                                                                                                                                                                                                                |
| `domain/question.test.ts`                                                                              | seeded RNG gives fixed questions; value always in 10…80 by 10; `from`/`to` always neighbours; down multiplies, up divides; every step of every family reachable (sweep 1000 seeds); boundaries (first/last step); g↔mg uses ×1000; no float noise (`80 m → km` is exactly `0.08`, `30 dl → l` is exactly `3`); never repeats `previous` |
| `domain/numbers.test.ts`                                                                               | `parseAnswer` table: `"4"`, `"0,5"`, `"0.5"`, `",5"`, `" 80 000 "`, nbsp, `"80000,0"` → numbers; `""`, `"-1"`, `"abc"`, `"1,2,3"`, `"1e3"`, `"4 l"` → null; `formatNumber` for 4, 0,08, 80 000, 0,000001; `isCorrect` with tolerance edges                                                                                              |
| `domain/ladder.test.ts`                                                                                | chip count per family; from/to flags; active connector; label `×10 →` vs `← ÷10`; factor labels hidden when off                                                                                                                                                                                                                         |
| `domain/ruler.test.ts`                                                                                 | N+1 ticks; major every 5 (every 10 when N>30, mobile); done/current/pending states before and after checking                                                                                                                                                                                                                            |
| `domain/random.test.ts`                                                                                | mulberry32 is deterministic and in [0,1)                                                                                                                                                                                                                                                                                                |
| `state/quizReducer.test.ts`                                                                            | start resets everything; input updates text; check with empty input is a no-op; correct/wrong updates score and history; check twice doesn't double count; next creates a new question; last next → result; quit/done → start; full round of N                                                                                          |
| `storage/storage.test.ts`                                                                              | get/set roundtrip; corrupt JSON → default; `localStorage` throwing (private mode, quota) → no crash                                                                                                                                                                                                                                     |
| `storage/settings.test.ts`                                                                             | defaults; clamps questions to 3–60; rejects wrong types; save + load                                                                                                                                                                                                                                                                    |
| `storage/results.test.ts`                                                                              | first round sets best + last; better ratio replaces best; worse keeps best; tie rule; families kept separate                                                                                                                                                                                                                            |
| `hooks/useSettings.test.tsx`, `hooks/useResults.test.tsx`                                              | load on mount, persist on change                                                                                                                                                                                                                                                                                                        |
| `components/StartScreen.test.tsx`                                                                      | heading and 3 cards with unit chips; clicking a card starts that family; best/last line shown only when stored; gear opens settings; round text shows the configured count                                                                                                                                                              |
| `components/SettingsDialog.test.tsx`                                                                   | shows current values; change questions / toggles; Esc and close button; values saved                                                                                                                                                                                                                                                    |
| `components/QuizScreen.test.tsx` (with seeded RNG)                                                     | shows `Tal 1 av 30`, question and target unit; rätta disabled until input; correct answer → RÄTT!, green state, nästa; wrong → FEL! + "Rätt svar: 4 l"; Enter key flow; input focused and cleared on next question; ladder hidden/factors hidden by settings; Avsluta returns to start without saving; last question shows klar         |
| `components/ProgressRuler.test.tsx`, `UnitLadder.test.tsx`, `Feedback.test.tsx`, `AnswerForm.test.tsx` | rendering per state; a11y attributes (`role="status"`, `aria-label`, `aria-hidden`)                                                                                                                                                                                                                                                     |
| `components/ResultScreen.test.tsx`                                                                     | score, total, "Du fick X rätt av Y tal.", one square per question with right/wrong state, klar → start                                                                                                                                                                                                                                  |
| `App.test.tsx`                                                                                         | integration: play a whole 3-question round with a seeded RNG (2 right, 1 wrong), see `2/3`, return to start and see `Senast 2/3` on the card                                                                                                                                                                                            |

Plus an automated accessibility smoke check (`vitest-axe`) on each screen.

## 8. E2E plan (Playwright)

Run against `vite preview` in CI, on two projects: **desktop 1024×768** and **mobile 390×844**.

- `round.spec.ts`: set 3 questions in settings, play a round per family. The helper reads `"40 dl"` and `"l"` from the page and computes the answer with `src/domain`, answers 2 right and 1 wrong, checks the result screen, then checks the saved score on the start card after reload.
- `settings.spec.ts`: toggles survive a reload; ladder appears and disappears.
- Mobile project also asserts the stacked layout (cards are one column, Avsluta is icon-only).

No test-only hooks are shipped in the app.

## 9. GitHub

1. `git init` in `~/source/enheter`, branch `main`, `.gitignore` for Node/Vite/Playwright/coverage and macOS `._*` / `.DS_Store` files.
2. `gh repo create MagnusNordin/enheter --public --source . --push --description "Träning för olika enheter – öva på att räkna om g, m och l"`.
3. Pages: set the source to GitHub Actions (`gh api -X POST repos/MagnusNordin/enheter/pages -f build_type=workflow`). The app is served at `https://magnusnordin.github.io/enheter/`, so `vite.config.ts` uses `base: '/enheter/'`.
4. **`ci.yml`** (push + PR): `npm ci` → `lint` → `typecheck` → `test:coverage` (fails under threshold) → `build` → `playwright install --with-deps chromium` → `test:e2e`. Upload the coverage report and Playwright traces on failure.
5. **`deploy.yml`** (push to main, after CI passes): build, `actions/upload-pages-artifact`, `actions/deploy-pages`.
6. Branch protection on `main` requiring the CI check (optional; only on your OK).
7. README in Swedish and English: what it is, live link, `npm` scripts, how tests run, link to the design.

npm scripts: `dev`, `build`, `preview`, `lint`, `format`, `typecheck`, `test`, `test:watch`, `test:coverage`, `test:e2e`.

## 10. Implementation order

Each phase ends green (lint + tests) and is one commit, or a small PR once the repo exists.

| #   | Phase                                                                                                                               | Done when                                           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 1   | Scaffold Vite + React + TS, ESLint, Prettier, Vitest, Playwright config, fonts, tokens; `git init`; create the GitHub repo and push | empty app builds; `npm test` runs; repo exists      |
| 2   | CI workflow + Pages deploy workflow                                                                                                 | first green CI run; placeholder page live on Pages  |
| 3   | Domain layer + its tests                                                                                                            | `src/domain` at ~100% coverage                      |
| 4   | Quiz reducer + storage + hooks + tests                                                                                              | reducer and storage fully tested                    |
| 5   | Start screen + settings dialog (desktop + mobile CSS) + tests                                                                       | matches design start artboards                      |
| 6   | Quiz screen: header, ruler, answer form, feedback, ladder + tests                                                                   | matches Fråga / Rätt svar / Fel svar artboards      |
| 7   | Result screen + saving results + tests                                                                                              | matches Resultat artboards; best/last on cards      |
| 8   | App integration test, axe checks, Playwright e2e                                                                                    | coverage threshold met; e2e green on both viewports |
| 9   | Visual pass against the design at 1024×768 and 390×844, README, final deploy                                                        | live app matches the canvas                         |

**Status (2026-10-16): all nine phases are done.** The app is live at https://magnusnordin.github.io/enheter/.

Changes from the plan made along the way:

- **hg → g is ×100**, not ×10 as in the design prototype. The families test checks factors against the old `parts.json`. The design canvas was corrected too.
- **Start cards** use their visible text as the button name (WCAG 2.5.3, found by axe) instead of an `aria-label`.
- **Phone ladder**: factor labels sit above the chips so "×1 000" doesn't cover the units.
- **Tablets (720–1023px)** get the desktop layout with the question row and ladder scaling down to fit. The design only covers 1024 and 390, and at 768px the widest question overflowed. Playwright now also runs a 768×1024 tablet project.

## 11. Open points for later (not in scope now)

- PWA/offline install for tablets.
- More families (e.g. area m², time) or "skip a step" questions (km → cm).
- English UI.
