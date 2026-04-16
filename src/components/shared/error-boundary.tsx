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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
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
