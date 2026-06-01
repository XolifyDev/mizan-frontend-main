"use client";

import Link from "next/link";
import { ArrowRight, Boxes, MonitorSmartphone, Package2, Settings2, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";

function withMasjid(path: string, masjidId?: string) {
  return masjidId ? `${path}?masjidId=${masjidId}` : path;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const masjidId = searchParams.get("masjidId") || "";

  const productAreas = [
    {
      title: "Manage Products",
      description: "Create, edit, and assign the hardware and service catalog used across Mizan.",
      href: withMasjid("/dashboard/products/manage", masjidId),
      icon: Settings2,
      tone: "bg-[#550C18] text-white",
    },
    {
      title: "MizanDonations Kiosk",
      description: "Open the donation kiosk product configuration and related rollout settings.",
      href: withMasjid("/dashboard/products/mizan-donations", masjidId),
      icon: MonitorSmartphone,
      tone: "bg-white text-[#2e0c12] border border-[#550C18]/10",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-[#550C18]/10 bg-[linear-gradient(135deg,rgba(85,12,24,0.08),rgba(255,255,255,1)_42%,rgba(85,12,24,0.03))] p-6 shadow-[0_30px_80px_-56px_rgba(85,12,24,0.55)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge className="border border-[#550C18]/10 bg-white/80 text-[#550C18] hover:bg-white">
              Product Operations
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#2e0c12] md:text-4xl">
              Manage the product layer behind kiosks, services, and hardware fulfillment.
            </h1>
            <p className="mt-3 text-base text-[#6d5560] md:text-lg">
              This is the commercial control surface for the masjid-facing products you assign,
              sell, and maintain through Mizan.
            </p>
          </div>
          <Button asChild className="bg-[#550C18] text-white hover:bg-[#6a1220]">
            <Link href={withMasjid("/dashboard/products/manage", masjidId)}>Open Product Manager</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {productAreas.map((area) => (
          <Link
            key={area.title}
            href={area.href}
            className={`group rounded-[28px] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${area.tone}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-2xl bg-black/5 p-3">
                <area.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 opacity-50 transition group-hover:opacity-100" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">{area.title}</h2>
            <p className="mt-2 text-sm opacity-80">{area.description}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#550C18]/8 p-3 text-[#550C18]">
                <Package2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-[#2e0c12]">Hardware Catalog</CardTitle>
                <CardDescription>Donation kiosks, signage devices, and fulfillment items.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-[#6d5560]">
            Keep device-related products consistent so assigned hardware and purchase records stay aligned.
          </CardContent>
        </Card>

        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#550C18]/8 p-3 text-[#550C18]">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-[#2e0c12]">Storefront Readiness</CardTitle>
                <CardDescription>Public product pages should reflect the real service model.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-[#6d5560]">
            Use the product manager to keep pricing, descriptions, and product types in sync with checkout flows.
          </CardContent>
        </Card>

        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#550C18]/8 p-3 text-[#550C18]">
                <Boxes className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-[#2e0c12]">Assignment Workflow</CardTitle>
                <CardDescription>Admin-side provisioning should stay separated from customer management.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-[#6d5560]">
            Product setup can happen here, but device assignment and pre-shipping provisioning should stay controlled in the admin flow.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
