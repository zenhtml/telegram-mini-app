# AGENTS.md

## Status

Telegram Mini App built with **React 19 + Vite 8 + TypeScript** and the
**@tma.js/sdk** (`@tma.js/sdk` + `@tma.js/sdk-react`). Frontend-only; deployed
to GitHub Pages as a static site. No backend or bot yet. Tests use Vitest.

## Commands

```bash
npm run dev          # Vite dev server (http://localhost:5173, host: true)
npm run build        # tsc -b && vite build  -> dist/
npm run preview      # preview the production build
npm run typecheck    # tsc -b --noEmit
npm run lint         # eslint .
npm run lint:fix     # eslint . --fix
npm run format       # prettier --write .
npm run format:check # prettier --check .
npm test             # vitest (watch mode)
npm run test:run     # vitest run (single pass, CI-friendly)
```

`build` runs type-checking first, so a failing `typecheck` will also fail
`build`. ESLint uses flat config (`eslint.config.js`); Prettier config lives in
`.prettierrc.json`. Vitest config is in `vitest.config.ts` (jsdom environment,
globals enabled, setup file `src/test-setup.ts` for jest-dom matchers).

## Architecture

- **Entry:** `src/main.tsx` calls `initTelegram()` (from `src/env.ts`) at module
  load, then mounts React.
- **SDK init + mock:** `src/env.ts` — initializes the SDK and installs a mock
  Telegram environment for local development (see gotchas below).
- **App:** `src/App.tsx` — demo of user data, theme params, `MainButton`, and
  haptic feedback. Uses a local `useMount` helper for the SDK mount lifecycle.
- **Error boundary:** `src/components/ErrorBoundary.tsx` — class component that
  catches render errors and shows a fallback UI with a reload button. In dev
  mode it also displays the error stack trace.
- **Tests:** `src/env.test.ts` tests `isRealTelegram()` across browser/iframe/
  cross-origin scenarios; `src/components/ErrorBoundary.test.tsx` tests child
  rendering, error fallback, and dev-mode stack trace. Uses
  `@testing-library/react` + jest-dom matchers (setup in `src/test-setup.ts`).
- **Deploy:** `.github/workflows/deploy.yml` builds and publishes `dist/` to
  GitHub Pages on push to `main`. `vite.config.ts` sets `base: "./"` so the
  build works under the `/<repo-name>/` sub-path.

## @tma.js/sdk v3 — critical gotchas

These are non-obvious and cost significant debugging to discover:

- **Do NOT load the official `telegram-web-app.js` script.** It conflicts with
  `@tma.js/sdk` (both register global message handlers) and breaks environment
  detection. The SDK is a complete standalone replacement.
- **`isTMA()` is unreliable when called synchronously** — it performs an async
  `postMessage` round-trip and returns a wrong value in a browser. `src/env.ts`
  uses `isRealTelegram()` instead, which checks `window.TelegramWebviewProxy`
  directly (the same signal `postEvent` relies on).
- **Mock launch data must include `hash` and `signature`** fields or
  `mockTelegramEnv()` throws a schema-validation error. See `mockLaunchParams()`
  in `src/env.ts`.
- **SDK components are singletons that must be mounted** before use
  (`miniApp`, `themeParams`, `mainButton`, …). Call `component.mount()` in an
  effect and `component.unmount()` on cleanup. Reading signals before mount
  returns empty/default values.
- **`hapticFeedback` does NOT need mounting** — unlike other SDK components,
  `impactOccurred`, `notificationOccurred` and `selectionChanged` call
  `postEvent` directly and work immediately after SDK `init()`.
- **Reactivity model:** properties like `themeParams.textColor` are signals
  (callable getters). Subscribe in React via `useSignal(themeParams.textColor)`.
  Read launch/user data via `useLaunchParams()`.
- **No `SDKProvider`** — v3 does not use a context provider. Components are
  module-level singletons imported from `@tma.js/sdk-react`.

## Backend / bot

Undecided. GitHub Pages is static-only, so server-side `initData` validation or
payment handling requires a separate backend (not yet present in this repo).
