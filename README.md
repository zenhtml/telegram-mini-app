# Telegram Mini App

A Telegram Mini App starter built with **React 19**, **Vite 8**, **TypeScript**, and the
[**@tma.js/sdk**](https://github.com/Telegram-Mini-Apps/tma.js) — a fully typed, signal-based
client SDK for the Telegram Mini Apps platform.

The app demonstrates core Mini App capabilities: reading user & launch data, reactive theme
parameters, the `MainButton`, and haptic feedback. It runs locally in any browser thanks to a
built-in mock environment, and deploys to GitHub Pages via an included CI workflow.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [How the SDK integration works](#how-the-sdk-integration-works)
- [Local development & the mock environment](#local-development--the-mock-environment)
- [Connecting to Telegram](#connecting-to-telegram)
- [Deployment to GitHub Pages](#deployment-to-github-pages)
- [Key gotchas](#key-gotchas)

---

## Tech stack

| Concern        | Choice                          |
| -------------- | ------------------------------- |
| UI framework   | React 19                        |
| Build tool     | Vite 8                          |
| Language       | TypeScript (strict)             |
| Telegram SDK   | `@tma.js/sdk` + `@tma.js/sdk-react` |
| Hosting        | GitHub Pages (static, HTTPS)    |

> **Why `@tma.js/sdk` and not the official `telegram-web-app.js`?**
> `@tma.js/sdk` is a complete, typed replacement for the official script. It provides
> reactive signals, structured launch-data parsing, and per-feature components
> (`mainButton`, `themeParams`, `miniApp`, …). The two are **mutually exclusive** — do not
> load `https://telegram.org/js/telegram-web-app.js` alongside this SDK (see
> [Key gotchas](#key-gotchas)).

---

## Prerequisites

- **Node.js** `^20.19.0 || >=22.12.0` (Vite 8 requirement)
- **npm** (a `package-lock.json` is committed, so `npm ci` is used in CI)
- A **Telegram bot** for real-device testing (see [Connecting to Telegram](#connecting-to-telegram))

---

## Getting started

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev
```

Open <http://localhost:5173/> in any browser. The app renders immediately using a **mock
Telegram environment** — no Telegram client required. You'll see a fake user ("Developer
User"), mock theme colors, and working UI controls.

---

## Available scripts

| Command           | Description                                                        |
| ----------------- | ------------------------------------------------------------------ |
| `npm run dev`     | Start the Vite dev server with HMR (`host: true` exposes the LAN). |
| `npm run build`   | Type-check (`tsc -b`) then produce a production build in `dist/`.  |
| `npm run preview` | Preview the production build locally.                              |
| `npm run typecheck` | Run the TypeScript compiler without emitting (`tsc -b --noEmit`). |

---

## Project structure

```
.
├── .github/workflows/deploy.yml   # CI: build + deploy to GitHub Pages
├── index.html                     # Vite entry HTML
├── vite.config.ts                 # Vite config (relative base, React plugin)
├── tsconfig.json                  # TS project references root
├── tsconfig.app.json              # TS config for src/
├── tsconfig.node.json             # TS config for vite.config.ts
└── src/
    ├── main.tsx                   # Entry: calls initTelegram(), mounts React
    ├── env.ts                     # SDK init + mock environment for local dev
    ├── App.tsx                    # Demo app (user info, theme, MainButton, haptics)
    ├── index.css                  # Styles, driven by --tg-theme-* CSS variables
    └── vite-env.d.ts
```

---

## How the SDK integration works

`@tma.js/sdk` v3 uses a **component + signal** model. The integration is set up in three
layers:

### 1. Initialization — `src/env.ts`

`initTelegram()` is called once at module load (`src/main.tsx`). It:

1. Detects whether the app is running inside the real Telegram client (by checking for the
   native `window.TelegramWebviewProxy` or an iframe context — the same signals the bridge's
   `postEvent` relies on).
2. If **not** in Telegram, installs a mock environment via `mockTelegramEnv()` so the app is
   fully functional during local development.
3. Calls `init()`, which configures the SDK's global dependencies and signals Telegram that
   the app is ready.

### 2. Components & mounting — `src/App.tsx`

Each SDK feature (`miniApp`, `themeParams`, `mainButton`, …) is a **singleton component**
that must be **mounted** before use. Mounting restores the component's state and starts
listening for Telegram events. The `useMount` helper wires this into React's effect lifecycle:

```tsx
function useMount(component: Mountable): void {
  useEffect(() => {
    component.mount();
    return () => component.unmount();
  }, [component]);
}
```

### 3. Reactivity — signals

SDK properties (e.g. `themeParams.textColor`, `mainButton.isVisible`) are **signals** —
callable getters that track changes. Subscribe to them in React with `useSignal()`:

```tsx
const textColor = useSignal(themeParams.textColor); // re-renders on theme change
```

Launch parameters and user data are read synchronously with `useLaunchParams()`:

```tsx
const user = useLaunchParams().tgWebAppData?.user;
```

### CSS theming

`themeParams.bindCssVars()` (called after mounting `themeParams`) publishes the current theme
as CSS custom properties (`--tg-theme-bg-color`, `--tg-theme-text-color`, …). `src/index.css`
consumes these with sensible fallbacks, so the UI adapts to the user's light/dark theme
automatically.

---

## Local development & the mock environment

When opened outside Telegram (e.g. `http://localhost:5173/`), the app calls
`mockTelegramEnv()` with fabricated launch parameters, including:

- a fake **user** (`id`, `first_name`, `username`, …),
- a fake **theme** (light palette),
- mock `tgWebAppData` with dummy `hash`/`signature` values.

**What works locally:** UI rendering, theme variables, `MainButton`, haptic feedback (visually),
signal-based reactivity.

**What does NOT work locally:** real user identity, real `initData` cryptographic validation,
payments, biometrics, and any feature that requires the actual Telegram client to respond to
`postEvent` calls.

---

## Connecting to Telegram

To test with real Telegram data and features:

1. **Create a bot** — open [@BotFather](https://t.me/BotFather) in Telegram and run `/newbot`.
2. **Deploy the app** to any HTTPS host (see [Deployment](#deployment-to-github-pages)).
3. **Attach the Mini App** — in BotFather run `/setmenubutton`, select your bot, and provide
   your HTTPS URL. This adds a menu button that opens the Mini App.
4. **Open it** — launch your bot in Telegram and tap the menu button. The app now receives
   real launch parameters, user data, and theme.

> Telegram requires an **HTTPS** URL. Plain HTTP (like `http://localhost`) will be rejected by
> BotFather. For local testing on a physical device, tunnel `localhost` through an HTTPS proxy
> such as `ngrok`, `cloudflared`, or VS Code port forwarding.

---

## Deployment to GitHub Pages

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and publishes the app on
every push to `main`.

### One-time setup

1. Push the repository to GitHub.
2. In the repo, go to **Settings → Pages → Build and deployment** and set **Source** to
   **GitHub Actions**.
3. Push to `main` (or run the workflow manually via the Actions tab).

The app will be available at:

```
https://<your-username>.github.io/<repo-name>/
```

### Base path

`vite.config.ts` sets `base: "./"` (relative asset paths), so the build works correctly under
the `/<repo-name>/` sub-path without any per-repo configuration.

### Using the deployed URL with Telegram

Once deployed, set `https://<your-username>.github.io/<repo-name>/` as the bot's menu button
URL via BotFather's `/setmenubutton`.

---

## Key gotchas

- **Do not load the official `telegram-web-app.js`.** It conflicts with `@tma.js/sdk` (both
  register global message handlers), and its presence makes the SDK's environment detection
  unreliable. `@tma.js/sdk` is a standalone replacement.
- **`isTMA()` is not reliable synchronously.** Under the hood it performs an async
  `postMessage` round-trip; its synchronous return value can be wrong in a browser. `env.ts`
  instead checks `window.TelegramWebviewProxy` directly, mirroring what `postEvent` actually
  uses to decide whether a real Telegram client is present.
- **Mock `initData` requires a `signature` field.** The SDK validates the launch-data schema
  strictly; omitting `signature` (or `hash`) makes `mockTelegramEnv()` throw. See
  `mockLaunchParams()` in `src/env.ts`.
- **Components must be mounted.** Reading a component's signal before calling `mount()` will
  not throw, but the values will be empty/default. Always mount in an effect before relying on
  state or calling imperative methods like `mainButton.show()`.
- **GitHub Pages is static-only.** There is no server-side runtime. Server-side validation of
  `initData` (recommended for production) or payment handling requires a separate backend.
