# Enheter

**Träning för olika enheter** – en övningsapp för att räkna om mellan enheter för vikt (g), längd (m) och volym (l).

A Swedish practice app for converting metric units: pick gram, meter or liter, answer a round of questions like `40 dl = ? l`, and see your score.

Live: https://magnusnordin.github.io/enheter/

> Status: under construction. See [docs/PLAN.md](docs/PLAN.md) for the implementation plan.

## Development

Requires Node 24 (see `.nvmrc`).

```bash
npm install
npm run dev
```

| Script                  | What it does                                              |
| ----------------------- | --------------------------------------------------------- |
| `npm run dev`           | Start the Vite dev server                                 |
| `npm run build`         | Typecheck and build to `dist/`                            |
| `npm run preview`       | Serve the built app                                       |
| `npm run lint`          | ESLint                                                    |
| `npm run format`        | Prettier (write)                                          |
| `npm run typecheck`     | TypeScript project check                                  |
| `npm test`              | Unit tests (Vitest + React Testing Library)               |
| `npm run test:coverage` | Unit tests with coverage thresholds                       |
| `npm run test:e2e`      | Playwright end-to-end tests, desktop and mobile viewports |

Before the first e2e run, install the browser:

```bash
npx playwright install chromium
```

## Stack

Vite, React, TypeScript, CSS Modules, Vitest, React Testing Library, Playwright.

The design was made in Claude Design, with desktop (1024×768) and mobile (390×844) layouts. It replaces an older AngularJS version of the app.

## License

MIT
