import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initTelegram } from "./env";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

function initFailed(error: unknown): void {
  console.error("SDK initialization failed:", error);
  createRoot(document.getElementById("root")!).render(
    <div className="error-screen">
      <h1 className="error-title">Something went wrong</h1>
      <p className="error-message">
        The app encountered an unexpected error. Try reloading.
      </p>
      <button
        type="button"
        className="btn"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
      {import.meta.env.DEV && error instanceof Error && (
        <pre className="error-stack">
          {error.name}: {error.message}
          {error.stack ? `\n\n${error.stack}` : ""}
        </pre>
      )}
    </div>,
  );
}

try {
  initTelegram();
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} catch (error) {
  initFailed(error);
}
