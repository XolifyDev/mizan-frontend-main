import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Clock3,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserMasjid } from "@/lib/actions/masjid";

type SettingsPageProps = {
  searchParams: Promise<{
    masjidId?: string;
  }>;
};

function withMasjid(path: string, masjidId?: string) {
  return masjidId ? `${path}?masjidId=${masjidId}` : path;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { masjidId } = await searchParams;
  const masjid = masjidId ? await getUserMasjid(masjidId) : null;

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-[#550C18]/10 bg-[linear-gradient(135deg,rgba(85,12,24,0.08),rgba(255,255,255,1)_42%,rgba(85,12,24,0.04))] p-6 shadow-[0_30px_80px_-56px_rgba(85,12,24,0.55)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge className="border border-[#550C18]/10 bg-white/80 text-[#550C18] hover:bg-white">
              Settings Hub
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#2e0c12] md:text-4xl">
              Keep masjid operations tidy, predictable, and ready to scale.
            </h1>
            <p className="mt-3 text-base text-[#6d5560] md:text-lg">
              Use this area to review organization details, sync prayer and donation workflows,
              and jump into the operational pages that control day-to-day behavior.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b6f76]">
                Active Masjid
              </p>
              <p className="mt-2 text-lg font-semibold text-[#2e0c12]">
                {masjid?.name || "Select a masjid"}
              </p>
              <p className="mt-1 text-sm text-[#6d5560]">
                {masjid?.timezone || "Timezone not configured yet"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b6f76]">
                Focus Right Now
              </p>
              <p className="mt-2 text-lg font-semibold text-[#2e0c12]">
                Explicit saves only
              </p>
              <p className="mt-1 text-sm text-[#6d5560]">
                We are keeping settings predictable and avoiding silent changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#550C18]/8 p-3 text-[#550C18]">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-[#2e0c12]">Organization Profile</CardTitle>
                <CardDescription>Reference your core masjid information.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[#6d5560]">
            <p>
              Name, address, timezone, and public identity should stay consistent across
              signage, donation flows, and communications.
            </p>
            <div className="rounded-2xl border border-[#550C18]/10 bg-[#fffafb] p-3">
              <p className="font-medium text-[#2e0c12]">Current timezone</p>
              <p className="mt-1">{masjid?.timezone || "Not configured"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#550C18]/8 p-3 text-[#550C18]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-[#2e0c12]">Access & Roles</CardTitle>
                <CardDescription>Use focused roles instead of broad access.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[#6d5560]">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-[#550C18] text-white hover:bg-[#550C18]">Mosque Admin</Badge>
              <Badge variant="outline" className="border-[#550C18]/15 text-[#550C18]">Content</Badge>
              <Badge variant="outline" className="border-[#550C18]/15 text-[#550C18]">Timings</Badge>
              <Badge variant="outline" className="border-[#550C18]/15 text-[#550C18]">Donations</Badge>
            </div>
            <p>
              Users should only see the parts of the dashboard they actually need to operate.
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#550C18]/8 p-3 text-[#550C18]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-[#2e0c12]">Operational Standard</CardTitle>
                <CardDescription>Fewer surprises, cleaner workflows.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[#6d5560]">
            <p>
              Device assignment happens in the admin app. Dashboard users manage what is already
              assigned to their masjid.
            </p>
            <p>
              Content, prayer times, and donations should all use explicit save actions and clear
              review states.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2e0c12]">Operational Shortcuts</CardTitle>
            <CardDescription>
              Jump into the pages where the real settings work is already happening.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              {
                href: withMasjid("/dashboard/prayer-times", masjidId),
                icon: Clock3,
                title: "Prayer Times",
                description: "Iqamah schedules, calculation settings, and monthly generation.",
              },
              {
                href: withMasjid("/dashboard/donations/settings", masjidId),
                icon: CreditCard,
                title: "Donation Settings",
                description: "Kiosk-facing preferences, categories, and donation workflow rules.",
              },
              {
                href: withMasjid("/dashboard/users", masjidId),
                icon: Users,
                title: "Users & Roles",
                description: "Invite teammates, remove access, and keep responsibilities clean.",
              },
              {
                href: withMasjid("/dashboard/events", masjidId),
                icon: CalendarDays,
                title: "Events & Calendar",
                description: "Keep event publishing aligned with public calendars and signage.",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-[#550C18]/10 bg-[#fffafb] p-4 transition-all hover:-translate-y-0.5 hover:border-[#550C18]/20 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-2xl bg-white p-3 text-[#550C18] shadow-sm">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#550C18]/40 transition group-hover:text-[#550C18]" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#2e0c12]">{item.title}</h3>
                <p className="mt-2 text-sm text-[#6d5560]">{item.description}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#550C18]/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2e0c12]">Recommended Sequence</CardTitle>
            <CardDescription>
              This is the smoothest order for getting a new masjid fully operational.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Confirm masjid identity details and timezone first.",
              "Set prayer calculations and publish the current iqamah schedule.",
              "Configure donation categories before kiosk-facing testing.",
              "Invite the right staff members and keep access role-specific.",
            ].map((step, index) => (
              <div key={step} className="flex gap-4 rounded-2xl border border-[#550C18]/10 bg-[#fffafb] p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#550C18] text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-sm text-[#4a3138]">{step}</p>
              </div>
            ))}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild className="bg-[#550C18] text-white hover:bg-[#6a1220]">
                <Link href={withMasjid("/dashboard/users", masjidId)}>Review Access</Link>
              </Button>
              <Button asChild variant="outline" className="border-[#550C18]/20 text-[#550C18] hover:bg-[#550C18]/5">
                <Link href={withMasjid("/dashboard/prayer-times", masjidId)}>Open Prayer Times</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
