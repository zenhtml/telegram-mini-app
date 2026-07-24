import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

afterEach(() => {
  vi.restoreAllMocks();
});

function ThrowOnRender(): never {
  throw new Error("Kaboom from test");
}

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <p>Healthy child</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Healthy child")).toBeInTheDocument();
  });

  it("shows the error fallback when a child throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowOnRender />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The app encountered an unexpected error. Try reloading.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();
  });

  it("displays the error stack trace in dev mode", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(
      <ErrorBoundary>
        <ThrowOnRender />
      </ErrorBoundary>,
    );

    const stack = container.querySelector(".error-stack");
    expect(stack).not.toBeNull();
    expect(stack?.textContent).toContain("Kaboom from test");
  });
});
