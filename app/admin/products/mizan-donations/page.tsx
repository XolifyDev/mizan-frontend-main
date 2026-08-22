"use client";

import Link from "next/link";
import { ArrowRight, CreditCard, LayoutPanelTop, MonitorSmartphone, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";

function withMasjid(path: string, masjidId?: string) {
  return masjidId ? `${path}?masjidId=${masjidId}` : path;
}

export default function MizanDonationsPage() {
  const searchParams = useSearchParams();
  const masjidId = searchParams.get("masjidId") || "";

  const managementAreas = [
    {
      title: "Donation Categories",
      description: "Set category branding, amounts, and donor behavior before anything reaches the kiosk.",
      href: withMasjid("/dashboard/donations/categories", masjidId),
      icon: LayoutPanelTop,
    },
    {
      title: "Assigned Kiosks",
      description: "Review kiosk status, performance, and the devices already provisioned to this masjid.",
      href: withMasjid("/dashboard/donations/kiosk", masjidId),
      icon: MonitorSmartphone,
    },
    {
      title: "Donation Overview",
      description: "Check live giving activity and validate that the kiosk-facing configuration behaves correctly.",
      href: withMasjid("/dashboard/donations", masjidId),
      icon: Wallet,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-[#550C18]/10 bg-[linear-gradient(135deg,rgba(85,12,24,0.08),rgba(255,255,255,1)_42%,rgba(85,12,24,0.03))] p-6 shadow-[0_30px_80px_-56px_rgba(85,12,24,0.55)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge className="border border-[#550C18]/10 bg-white/80 text-[#550C18] hover:bg-white">
              MizanDonations Kiosk
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#2e0c12] md:text-4xl">
              Manage the donation kiosk product through real operational pages, not placeholder settings.
            </h1>
            <p className="mt-3 text-base text-[#6d5560] md:text-lg">
              This hub connects the live parts of the kiosk workflow: donation categories, assigned kiosk devices,
              and real giving activity. Device assignment still happens in the admin app before deployment.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-[#550C18] text-white hover:bg-[#6a1220]">
              <Link href={withMasjid("/dashboard/donations/categories/create", masjidId)}>
                Create Donation Category
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5">
              <Link href={withMasjid("/dashboard/donations/kiosk", masjidId)}>
                Open Kiosk Operations
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-[#550C18]/10 bg-white shadow-sm lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#550C18]/8 p-3 text-[#550C18]">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-[#2e0c12]">Operational Standard</CardTitle>
                <CardDescription>How this product should be run inside Mizan.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {[
              "Build donor categories before testing kiosk screens or receipts.",
              "Assign hardware from the admin app, then manage the assigned kiosk here.",
              "Use explicit save flows only so live donation behavior changes intentionally.",
            ].map((item, index) => (
              <div key={item} className="rounded-2xl border border-[#550C18]/10 bg-[#fffafb] p-4 text-sm text-[#4a3138]">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#550C18] text-sm font-semibold text-white">
                  {index + 1}
                </div>
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2e0c12]">Guardrails</CardTitle>
            <CardDescription>These keep kiosk management safer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[#6d5560]">
            <div className="rounded-2xl border border-[#550C18]/10 bg-[#fffafb] p-4">
              No kiosk creation from this dashboard.
            </div>
            <div className="rounded-2xl border border-[#550C18]/10 bg-[#fffafb] p-4">
              No silent configuration changes.
            </div>
            <div className="rounded-2xl border border-[#550C18]/10 bg-[#fffafb] p-4">
              Masjid-scoped donation setup only.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {managementAreas.map((area) => (
          <Link
            key={area.title}
            href={area.href}
            className="group rounded-[28px] border border-[#550C18]/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#550C18]/20 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-2xl bg-[#550C18]/8 p-3 text-[#550C18]">
                <area.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-[#550C18]/40 transition group-hover:text-[#550C18]" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-[#2e0c12]">{area.title}</h2>
            <p className="mt-2 text-sm text-[#6d5560]">{area.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
