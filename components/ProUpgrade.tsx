import Link from "next/link";
import { Lock, Check } from "lucide-react";

import { proPriceLabel } from "@/lib/plan";

const PRO_POINTS = [
  "Unlimited TV displays",
  "Geometric & Mihrab prayer templates",
  "Split-screen layouts",
  "Donations, kiosk & events",
  "Analytics and audit log",
  "Up to 10 team members with roles",
];

/**
 * Shown in place of a Pro page's content when the masjid is on the Free plan.
 */
export function ProUpgrade({
  feature,
  masjidId,
}: {
  feature?: string;
  masjidId?: string | null;
}) {
  const billingHref = masjidId
    ? `/dashboard/billing?masjidId=${masjidId}`
    : "/dashboard/billing";

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-[#550C18]/12 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#550C18]/8">
          <Lock className="h-5 w-5 text-[#550C18]" />
        </div>

        <span className="mb-3 inline-block rounded-full bg-gradient-to-r from-[#550C18] to-[#78001A] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Pro
        </span>

        <h1 className="mb-2 text-xl font-semibold text-[#1f2937]">
          {feature ? `${feature} is a Pro feature` : "This is a Pro feature"}
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-[#6b7280]">
          Upgrade your masjid to unlock it, along with everything else in Pro.
        </p>

        <ul className="mb-7 space-y-2 text-left">
          {PRO_POINTS.map((point) => (
            <li key={point} className="flex items-start gap-2 text-sm text-[#3A3A3A]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#550C18]" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <Link
          href={billingHref}
          className="block w-full rounded-lg bg-[#550C18] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#78001A]"
        >
          View plans
        </Link>
        <p className="mt-3 text-xs text-[#9ca3af]">{proPriceLabel()}/month · cancel anytime</p>
      </div>
    </div>
  );
}
