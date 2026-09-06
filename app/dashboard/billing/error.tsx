"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

/**
 * Route-level error boundary for billing.
 *
 * Without this, a render failure bubbles to the app-wide handler and the user
 * sees only "Application error" plus a digest — which says nothing about what
 * broke or whether their subscription is affected.
 */
export default function BillingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[billing] render failed", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-[#550C18]/12 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
          <AlertCircle className="h-5 w-5 text-amber-600" />
        </div>
        <h1 className="mb-2 text-xl font-semibold text-[#1f2937]">
          Billing couldn&apos;t load
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-[#6b7280]">
          Your subscription and payment methods are unaffected — this page just
          failed to render. Try again, and contact support if it keeps happening.
        </p>

        <button
          onClick={reset}
          className="w-full rounded-lg bg-[#550C18] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#78001A]"
        >
          Try again
        </button>

        {error.digest && (
          <p className="mt-4 font-mono text-xs text-[#9ca3af]">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
