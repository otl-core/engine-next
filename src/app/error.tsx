/**
 * Global Error Handler
 * Catches unhandled errors at the app level
 */

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          We apologize for the inconvenience. Please try again.
        </p>
        {process.env.NODE_ENV === "development" && (
          <details className="text-left bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
            <summary className="cursor-pointer font-semibold text-destructive mb-2">
              Error Details
            </summary>
            <pre className="text-xs text-destructive overflow-auto">
              {error.message}
              {"\n\n"}
              {error.stack}
            </pre>
          </details>
        )}
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-muted text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-muted/80 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
