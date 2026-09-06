import { Check, Sparkles } from "lucide-react";

import {
  startProCheckout,
  openBillingPortal,
  isBillingConfigured,
} from "@/lib/actions/subscription";
import { PromoCodeField } from "@/components/PromoCodeField";
import { proPriceLabel } from "@/lib/plan";

const PRO_POINTS = [
  "Unlimited TV displays",
  "Geometric & Mihrab prayer templates",
  "Split-screen layouts",
  "Donations, kiosk & events",
  "Analytics and audit log",
  "Up to 10 team members with roles",
];

export async function PlanCard({
  masjidId,
  plan,
  planStatus,
  periodEnd,
  isOwner,
}: {
  masjidId: string;
  plan: string;
  planStatus?: string | null;
  periodEnd?: Date | null;
  isOwner: boolean;
}) {
  const isPro = plan === "PRO";
  // Checkout needs STRIPE_PRO_PRICE_ID and a Stripe key. Without them the
  // upgrade button can't work, so say so rather than offering a dead control.
  const canCheckout = isPro || (await isBillingConfigured());

  return (
    <div className="mb-6 rounded-2xl border border-[#550C18]/12 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-lg font-semibold text-[#1f2937]">
              {isPro ? "Mizan Pro" : "Free plan"}
            </h2>
            {isPro && (
              <span className="rounded-full bg-gradient-to-r from-[#550C18] to-[#78001A] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Pro
              </span>
            )}
          </div>
          <p className="text-sm text-[#6b7280]">
            {isPro
              ? periodEnd
                ? `Renews ${periodEnd.toLocaleDateString()}`
                : "Active"
              : "1 display · prayer times & announcements"}
          </p>
          {isPro && planStatus === "past_due" && (
            <p className="mt-2 text-sm font-medium text-amber-600">
              Payment failed — update your card to avoid losing Pro.
            </p>
          )}
        </div>

        {!isPro && (
          <div className="text-right">
            <div className="text-2xl font-bold text-[#550C18]">{proPriceLabel()}</div>
            <div className="text-xs text-[#9ca3af]">per month</div>
          </div>
        )}
      </div>

      {!isPro && (
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {PRO_POINTS.map((point) => (
            <li
              key={point}
              className="flex items-start gap-2 text-sm text-[#3A3A3A]"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#550C18]" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}

      {isOwner && !canCheckout ? (
        <p className="mt-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Upgrades aren&apos;t available right now. Please try again shortly or
          contact support.
        </p>
      ) : isOwner ? (
        <form
          action={async (formData: FormData) => {
            "use server";
            if (isPro) {
              await openBillingPortal(masjidId);
              return;
            }
            const promo = formData.get("promoCode");
            await startProCheckout(
              masjidId,
              typeof promo === "string" ? promo : undefined
            );
          }}
        >
          <button
            type="submit"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#550C18] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#78001A]"
          >
            {!isPro && <Sparkles className="h-4 w-4" />}
            {isPro ? "Manage subscription" : "Upgrade to Pro"}
          </button>
          {!isPro && <PromoCodeField />}
        </form>
      ) : (
        <p className="mt-6 text-sm text-[#9ca3af]">
          Only the masjid owner can change the plan.
        </p>
      )}
    </div>
  );
}
