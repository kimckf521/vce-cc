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

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Report error to monitoring endpoint
    fetch("/api/error-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack?.slice(0, 2000),
        componentStack: errorInfo.componentStack?.slice(0, 2000),
        url: typeof window !== "undefined" ? window.location.href : undefined,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-lg font-bold text-red-700 mb-2">Something went wrong</h2>
          <p className="text-sm text-red-600 mb-4">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
