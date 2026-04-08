"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — catches render errors anywhere in the subtree.
 * Shows a minimal recovery UI so the app doesn't go fully blank.
 * Must be a class component (React error boundaries require class lifecycle).
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Log to console in dev; in production this would go to an error reporter
    console.error("[Sous ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-dvh bg-[var(--nourish-cream)] flex flex-col items-center justify-center gap-5 px-6 text-center">
          <span className="text-4xl">🥄</span>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-[var(--nourish-dark)]">
              Something went wrong
            </p>
            <p className="text-xs text-[var(--nourish-subtext)] max-w-[240px]">
              Sous hit an unexpected error. Tap below to try again.
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="rounded-xl bg-[var(--nourish-green)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--nourish-dark-green)]"
            type="button"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
