"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error:    Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Post to /api/log-error (fire-and-forget, don't crash on failure)
    try {
      fetch("/api/log-error", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          error_type:  "react_boundary",
          message:     error.message,
          stack_trace: `${error.stack ?? ""}\n\nComponent stack:\n${info.componentStack ?? ""}`,
          url:         typeof window !== "undefined" ? window.location.href : null,
        }),
      }).catch(() => {});
    } catch {
      // silently ignore
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-1">
            Etwas ist schiefgelaufen
          </h2>
          <p className="text-sm text-red-600 dark:text-red-400 text-center max-w-md">
            {this.state.error?.message ?? "Ein unbekannter Fehler ist aufgetreten."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
