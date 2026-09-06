"use client";

import React from "react";

/**
 * Component-level error boundary.
 *
 * Next's `error.tsx` only works per route segment, so one failing component
 * takes the whole page with it. This isolates a single section: the rest of the
 * page renders, and the failure is labelled where it happened.
 */
export class SectionBoundary extends React.Component<
  { name: string; children: React.ReactNode },
  { error: (Error & { digest?: string }) | null }
> {
  state: { error: (Error & { digest?: string }) | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[${this.props.name}] section failed`, error, info);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-medium">{this.props.name} couldn&apos;t load.</p>
        <p className="mt-0.5 text-amber-800">
          The rest of this page is unaffected.
        </p>
        {(error.digest || error.message) && (
          <p className="mt-2 font-mono text-xs text-amber-700">
            {error.digest ? `Reference: ${error.digest}` : error.message}
          </p>
        )}
      </div>
    );
  }
}
