import Link from "next/link";
import Image from "next/image";
import {
  Clock3,
  CreditCard,
  Users,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import { getUserMasjid } from "@/lib/actions/masjid";
import { OrganizationForm } from "./OrganizationForm";
import { StripeConnectCard } from "./StripeConnectCard";
import { StripeFeesForm } from "./StripeFeesForm";
import { Suspense } from "react";

type SettingsPageProps = {
  searchParams: Promise<{ masjidId?: string }>;
};

function withMasjid(path: string, masjidId?: string) {
  return masjidId ? `${path}?masjidId=${masjidId}` : path;
}

const links = [
  { href: "/dashboard/prayer-times", icon: Clock3, label: "Prayer Times", desc: "Iqamah, calculation method, monthly schedule" },
  { href: "/dashboard/donations/settings", icon: CreditCard, label: "Donation Settings", desc: "Categories, kiosk config, payment rules" },
  { href: "/dashboard/users", icon: Users, label: "Users & Roles", desc: "Invite staff, manage access levels" },
  { href: "/dashboard/events", icon: CalendarDays, label: "Events", desc: "Calendar, signage sync, recurring events" },
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing", desc: "Subscriptions, orders, invoices" },
];

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { masjidId } = await searchParams;
  const masjidResult = await getUserMasjid(masjidId);
  const masjid = masjidResult && "id" in masjidResult ? masjidResult : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Page header */}
      <div className="pb-2">
        <h1 className="text-2xl font-semibold text-[#2e0c12]">Settings</h1>
        <p className="mt-1 text-sm text-[#8b6f76]">Manage your organization info and configure operational modules.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* LEFT — main content */}
        <div className="space-y-6">
          {/* Organization Profile */}
          <section className="rounded-2xl border border-[#550C18]/10 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              {masjid?.logo ? (
                <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-[#550C18]/10">
                  <Image src={masjid.logo} alt="Logo" fill className="object-contain p-0.5" unoptimized />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#550C18]/8 text-base font-bold text-[#550C18]">
                  {masjid?.name?.[0] ?? "M"}
                </div>
              )}
              <div>
                <h2 className="text-base font-semibold text-[#2e0c12]">Organization Profile</h2>
                <p className="text-xs text-[#8b6f76]">Name, contact info, logo, and address</p>
              </div>
            </div>

            {masjid ? (
              <OrganizationForm masjid={masjid as any} />
            ) : (
              <div className="rounded-xl border border-dashed border-[#550C18]/20 bg-[#fffafb] px-6 py-10 text-center">
                <p className="text-sm text-[#8b6f76]">No masjid selected. Choose one from the sidebar to edit its profile.</p>
              </div>
            )}
          </section>

          {/* Stripe Connect */}
          {masjid && (
            <Suspense fallback={null}>
              <StripeConnectCard
                masjidId={masjid.id}
                stripeAccountId={(masjid as any).stripeAccountId ?? null}
                stripeAccountStatus={(masjid as any).stripeAccountStatus ?? null}
              />
            </Suspense>
          )}

          {/* Stripe Fees */}
          {masjid && (
            <StripeFeesForm
              masjidId={masjid.id}
              stripeFlatFee={(masjid as any).stripeFlatFee ?? 0.30}
              stripePercentageFee={(masjid as any).stripePercentageFee ?? 2.90}
            />
          )}
        </div>

        {/* RIGHT — quick links */}
        <div className="space-y-4">
          <section className="rounded-2xl border border-[#550C18]/10 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-[#2e0c12]">Quick Links</h2>
            <div className="space-y-1">
              {links.map((item) => (
                <Link
                  key={item.label}
                  href={withMasjid(item.href, masjidId)}
                  className="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-[#fffafb]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#550C18]/8 text-[#550C18] transition group-hover:bg-[#550C18] group-hover:text-white">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#2e0c12]">{item.label}</p>
                    <p className="truncate text-xs text-[#8b6f76]">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#550C18]/30 transition group-hover:text-[#550C18]" />
                </Link>
              ))}
            </div>
          </section>

          {/* Masjid meta */}
          {masjid && (
            <section className="rounded-2xl border border-[#550C18]/10 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-[#2e0c12]">Active Masjid</h2>
              <p className="text-sm font-medium text-[#2e0c12]">{masjid.name}</p>
              <p className="mt-0.5 text-xs text-[#8b6f76]">{masjid.timezone || "Timezone not set"}</p>
              {masjid.city && (
                <p className="mt-0.5 text-xs text-[#8b6f76]">{masjid.city}, {masjid.country}</p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
