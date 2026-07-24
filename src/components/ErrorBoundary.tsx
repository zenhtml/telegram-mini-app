import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Uncaught error:", error, info.componentStack);
  }

  render(): ReactNode {
    const { error } = this.state;

    if (error) {
      return (
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
          {import.meta.env.DEV && (
            <pre className="error-stack">
              {error.name}: {error.message}
              {error.stack ? `\n\n${error.stack}` : ""}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
