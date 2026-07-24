import { init, mockTelegramEnv } from "@tma.js/sdk-react";

const MOCK_THEME: Record<string, `#${string}`> = {
  bg_color: "#ffffff",
  text_color: "#17212b",
  hint_color: "#8e8e93",
  link_color: "#2481cc",
  button_color: "#5288c1",
  button_text_color: "#ffffff",
  secondary_bg_color: "#f0f0f5",
};

function mockLaunchParams() {
  return {
    tgWebAppPlatform: "tdesktop" as const,
    tgWebAppVersion: "8.0" as const,
    tgWebAppThemeParams: MOCK_THEME,
    tgWebAppData: new URLSearchParams({
      query_id: `AAH${Math.random().toString(36).slice(2)}`,
      user: JSON.stringify({
        id: 123456789,
        first_name: "Developer",
        last_name: "User",
        username: "dev_user",
        language_code: "en",
      }),
      auth_date: String(Math.floor(Date.now() / 1000)),
      hash: "a".repeat(32),
      signature: "b".repeat(64),
    }),
  };
}

/**
 * Mirrors the @tma.js bridge `postEvent` environment detection so we only mock
 * when the real Telegram client is truly absent. `isTMA()` is async under the
 * hood and returns an unreliable value when called synchronously in a browser.
 */
function isRealTelegram(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const w = window as unknown as {
    TelegramWebviewProxy?: { postEvent?: unknown };
    external?: { notify?: unknown };
  };
  return (
    typeof w.TelegramWebviewProxy?.postEvent === "function" ||
    typeof w.external?.notify === "function"
  );
}

export function initTelegram(): void {
  if (!isRealTelegram()) {
    mockTelegramEnv({ launchParams: mockLaunchParams() });
  }

  init();
}
