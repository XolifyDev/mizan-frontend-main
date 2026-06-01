import Link from "next/link";
import { ArrowRight, CreditCard, LayoutPanelTop, MonitorSmartphone, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DonationsSettingsPageProps = {
  searchParams: Promise<{
    masjidId?: string;
  }>;
};

function withMasjid(path: string, masjidId?: string) {
  return masjidId ? `${path}?masjidId=${masjidId}` : path;
}

export default async function DonationsSettingsPage({ searchParams }: DonationsSettingsPageProps) {
  const { masjidId } = await searchParams;

  const settingsAreas = [
    {
      title: "Donation Categories",
      description: "Control amounts, recurring options, branding, and kiosk visibility.",
      href: withMasjid("/dashboard/donations/categories", masjidId),
      icon: LayoutPanelTop,
    },
    {
      title: "Kiosk Operations",
      description: "Review assigned kiosks, current status, and live donation performance.",
      href: withMasjid("/dashboard/donations/kiosk", masjidId),
      icon: MonitorSmartphone,
    },
    {
      title: "Donation Overview",
      description: "Audit totals, recent gifts, and campaign performance from one view.",
      href: withMasjid("/dashboard/donations", masjidId),
      icon: Wallet,
    },
    {
      title: "Kiosk Product Setup",
      description: "Manage the donation hardware product and related service settings.",
      href: withMasjid("/dashboard/products/mizan-donations", masjidId),
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-[#550C18]/10 bg-[linear-gradient(135deg,rgba(85,12,24,0.08),rgba(255,255,255,1)_42%,rgba(85,12,24,0.03))] p-6 shadow-[0_30px_80px_-56px_rgba(85,12,24,0.55)] md:p-8">
        <Badge className="border border-[#550C18]/10 bg-white/80 text-[#550C18] hover:bg-white">
          Donations Settings
        </Badge>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-[#2e0c12] md:text-4xl">
              Keep donations clean, trustworthy, and easy for masjid staff to manage.
            </h1>
            <p className="mt-3 text-base text-[#6d5560] md:text-lg">
              This page is the control layer for kiosk-facing donation behavior. Use it to move
              into the parts of the donations workflow that actually need hands-on setup.
            </p>
          </div>
          <Button asChild className="bg-[#550C18] text-white hover:bg-[#6a1220]">
            <Link href={withMasjid("/dashboard/donations/categories/create", masjidId)}>
              Create Donation Category
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {settingsAreas.map((area) => (
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

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2e0c12]">Recommended Workflow</CardTitle>
            <CardDescription>
              This order keeps donation launches smoother and reduces rework.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Create or review donation categories first so kiosk options are accurate.",
              "Confirm amounts, recurring intervals, and donor-facing messaging.",
              "Review assigned kiosks after categories are ready, not before.",
              "Use the donations overview to validate real transactions after launch.",
            ].map((step, index) => (
              <div key={step} className="flex gap-4 rounded-2xl border border-[#550C18]/10 bg-[#fffafb] p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#550C18] text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-sm text-[#4a3138]">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2e0c12]">Important Guardrails</CardTitle>
            <CardDescription>We are keeping this workflow operationally safe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[#6d5560]">
            <div className="rounded-2xl border border-[#550C18]/10 bg-[#fffafb] p-4">
              Kiosks are assigned from the admin app, not created here.
            </div>
            <div className="rounded-2xl border border-[#550C18]/10 bg-[#fffafb] p-4">
              Category and content changes should use explicit save actions only.
            </div>
            <div className="rounded-2xl border border-[#550C18]/10 bg-[#fffafb] p-4">
              Donation settings should stay masjid-scoped so multi-masjid teams do not cross-configure each other.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
