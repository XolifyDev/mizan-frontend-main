"use client";

import { useState, useTransition } from "react";
import { Check, Tag, X } from "lucide-react";

import { validatePromoCode } from "@/lib/actions/subscription";

/**
 * Discount code entry for the upgrade card.
 *
 * The validated code is mirrored into a hidden input so it submits with the
 * surrounding checkout form. An unvalidated code still submits — Stripe is the
 * authority, and checkout re-checks it — so a slow or failed lookup never
 * blocks someone from upgrading.
 */
export function PromoCodeField() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const check = () => {
    startTransition(async () => {
      setResult(await validatePromoCode(code));
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        // block-level so it sits under the upgrade button, not beside it
        className="mt-4 flex w-fit items-center gap-1.5 text-sm font-medium text-[#550C18] underline-offset-2 hover:underline"
      >
        <Tag className="h-3.5 w-3.5" />
        Have a discount code?
      </button>
    );
  }

  return (
    <div className="mt-4">
      <label
        htmlFor="promo-code"
        className="mb-1.5 block text-sm font-medium text-[#3A3A3A]"
      >
        Discount code
      </label>
      <div className="flex gap-2">
        <input
          id="promo-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setResult(null);
          }}
          onKeyDown={(e) => {
            // Don't submit the outer checkout form on Enter.
            if (e.key === "Enter") {
              e.preventDefault();
              check();
            }
          }}
          placeholder="MASJID25"
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-lg border border-[#550C18]/20 px-3 py-2 text-sm uppercase tracking-wide outline-none focus:border-[#550C18] focus:ring-1 focus:ring-[#550C18]"
        />
        <button
          type="button"
          onClick={check}
          disabled={isPending || !code.trim()}
          className="shrink-0 rounded-lg border border-[#550C18]/25 px-3 py-2 text-sm font-medium text-[#550C18] transition-colors hover:bg-[#550C18]/5 disabled:opacity-50"
        >
          {isPending ? "Checking…" : "Apply"}
        </button>
      </div>

      {/* Submitted with the checkout form. */}
      <input type="hidden" name="promoCode" value={code} />

      {result && (
        <p
          className={`mt-2 flex items-center gap-1.5 text-sm ${
            result.valid ? "text-emerald-700" : "text-red-600"
          }`}
        >
          {result.valid ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          {result.message}
        </p>
      )}
    </div>
  );
}
