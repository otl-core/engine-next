/**
 * Error Boundary Component
 * Catches React errors and provides fallback UI
 */

"use client";

import React, { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-4">
          <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              We apologize for the inconvenience. Please try refreshing the
              page.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-left bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
                <summary className="cursor-pointer font-semibold text-destructive mb-2">
                  Error Details
                </summary>
                <pre className="text-xs text-destructive overflow-auto">
                  {this.state.error.toString()}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
