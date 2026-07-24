import { describe, it, expect, afterEach } from "vitest";
import { isRealTelegram } from "./env";

function cleanupWindow(): void {
  delete (window as unknown as Record<string, unknown>).TelegramWebviewProxy;
  (window as unknown as Record<string, unknown>).external = {};
  Object.defineProperty(window, "top", {
    value: window,
    writable: true,
    configurable: true,
  });
}

afterEach(() => {
  cleanupWindow();
});

describe("isRealTelegram", () => {
  it("returns false in a plain browser environment", () => {
    expect(isRealTelegram()).toBe(false);
  });

  it("returns true when TelegramWebviewProxy.postEvent exists", () => {
    (window as unknown as Record<string, unknown>).TelegramWebviewProxy = {
      postEvent: () => {},
    };
    expect(isRealTelegram()).toBe(true);
  });

  it("returns true when window.external.notify exists", () => {
    (window as unknown as Record<string, unknown>).external = {
      notify: () => {},
    };
    expect(isRealTelegram()).toBe(true);
  });

  it("returns true when running inside an iframe", () => {
    Object.defineProperty(window, "top", {
      value: {},
      writable: true,
      configurable: true,
    });
    expect(isRealTelegram()).toBe(true);
  });

  it("returns true when accessing window.top throws (cross-origin)", () => {
    Object.defineProperty(window, "top", {
      get() {
        throw new Error("Blocked by cross-origin policy");
      },
      configurable: true,
    });
    expect(isRealTelegram()).toBe(true);
  });
});
