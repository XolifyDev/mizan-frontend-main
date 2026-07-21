import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  Clock3,
  Download,
  Megaphone,
  Monitor,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { getUserMasjid } from "@/lib/actions/masjid";

type DashboardPageProps = {
  searchParams: Promise<{
    masjidId?: string;
  }>;
};

type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

const prayerOrder: PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const prayerTimeFieldMap = {
  Fajr: "fajr",
  Dhuhr: "dhuhr",
  Asr: "asr",
  Maghrib: "maghrib",
  Isha: "isha",
} as const;

const prayerIqamahFieldMap = {
  Fajr: "iqamahFajr",
  Dhuhr: "iqamahDhuhr",
  Asr: "iqamahAsr",
  Maghrib: "iqamahMaghrib",
  Isha: "iqamahIsha",
} as const;

const iqamahScheduleFieldMap = {
  Fajr: "fajr",
  Dhuhr: "dhuhr",
  Asr: "asr",
  Maghrib: "maghrib",
  Isha: "isha",
} as const;

function formatIqamahLabel(value?: string | null) {
  if (!value) return "--";
  if (value === "0") return "At Adhan";

  const normalized = value.trim().toUpperCase();
  const compact = normalized.replace(/\s+/g, "");
  const match = compact.match(/^(\d{1,2}):(\d{2})(AM|PM)?$/);

  if (!match) return value;

  const [, hour, minute, suffix] = match;
  if (!suffix) return `${hour.padStart(2, "0")}:${minute}`;
  return `${hour.padStart(2, "0")}:${minute} ${suffix}`;
}

function parseIqamahStringToDate(value: string, baseDate: Date) {
  const compact = value.trim().toUpperCase().replace(/\s+/g, "");
  const match = compact.match(/^(\d{1,2}):(\d{2})(AM|PM)?$/);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const suffix = match[3];

  if (suffix === "AM" && hour === 12) hour = 0;
  if (suffix === "PM" && hour !== 12) hour += 12;

  const result = new Date(baseDate);
  result.setHours(hour, minute, 0, 0);
  return result;
}

function formatTime(value: Date | null | undefined, timezone?: string) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone || "America/New_York",
  }).format(value);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

function getEventImage(event: { flyerUrl: string | null; tvFlyerUrl: string | null }) {
  return (
    event.tvFlyerUrl ||
    event.flyerUrl ||
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80"
  );
}

function withMasjid(path: string, masjidId?: string) {
  return masjidId ? `${path}?masjidId=${masjidId}` : path;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { masjidId } = await searchParams;

  if (!masjidId) {
    return (
      <div className="rounded-xl border border-[#550C18]/12 bg-white p-8">
        <h1 className="text-2xl font-semibold text-[#2e0c12]">Dashboard Overview</h1>
        <p className="mt-2 text-[#6d5560]">
          Select a masjid to load live operations and community metrics.
        </p>
      </div>
    );
  }

  const masjid = await getUserMasjid(masjidId);

  if (!masjid || ("error" in masjid && masjid.error)) {
    return (
      <div className="rounded-xl border border-[#550C18]/12 bg-white p-8">
        <h1 className="text-2xl font-semibold text-[#2e0c12]">Dashboard Overview</h1>
        <p className="mt-2 text-[#6d5560]">
          We couldn&apos;t load this masjid dashboard with your current access.
        </p>
      </div>
    );
  }

  const timezone = masjid.timezone || "America/New_York";
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const [
    todayPrayerTime,
    latestIqamah,
    donations,
    displays,
    events,
    contentCount,
    donationCategoryCount,
  ] = await Promise.all([
    prisma.prayerTime.findFirst({
      where: {
        masjidId,
        date: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.iqamahTiming.findFirst({
      where: { masjidId, changeDate: { lte: now } },
      orderBy: { changeDate: "desc" },
    }),
    prisma.donation.findMany({
      where: {
        masjidId,
        createdAt: { gte: weekStart },
        status: { not: "failed" },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.tVDisplay.findMany({
      where: { masjidId },
      select: { id: true, name: true, location: true, status: true, lastSeen: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.event.findMany({
      where: { masjidId, date: { gte: now } },
      select: { id: true, title: true, date: true, flyerUrl: true, tvFlyerUrl: true },
      orderBy: { date: "asc" },
      take: 3,
    }),
    prisma.content.count({ where: { masjidId, active: true } }),
    prisma.donationCategory.count({ where: { masjidId, active: true } }),
  ]);

  const prayerItems = prayerOrder.map((name, index) => {
    const adhanTime = todayPrayerTime?.[prayerTimeFieldMap[name]] ?? null;
    const prayerTimeIqamah = todayPrayerTime?.[prayerIqamahFieldMap[name]] ?? null;
    const scheduleIqamahRaw = latestIqamah?.[iqamahScheduleFieldMap[name]] ?? null;

    const iqamahDisplay = prayerTimeIqamah
      ? formatTime(prayerTimeIqamah, timezone)
      : formatIqamahLabel(scheduleIqamahRaw);

    const comparableIqamahTime =
      prayerTimeIqamah ||
      (scheduleIqamahRaw && scheduleIqamahRaw !== "0"
        ? parseIqamahStringToDate(scheduleIqamahRaw, now)
        : null);

    const activeTime = comparableIqamahTime || adhanTime;
    const nextPrayerTime =
      index < prayerOrder.length - 1
        ? todayPrayerTime?.[prayerTimeFieldMap[prayerOrder[index + 1]]]
        : null;

    return {
      name,
      adhan: formatTime(adhanTime, timezone),
      iqamah: iqamahDisplay,
      activeTime: activeTime ? new Date(activeTime).getTime() : null,
      nextPrayerTime: nextPrayerTime ? new Date(nextPrayerTime).getTime() : null,
    };
  });

  const activePrayerName =
    [...prayerItems]
      .filter((p) => p.activeTime !== null)
      .filter((p) => now.getTime() >= (p.activeTime as number))
      .sort((a, b) => (b.activeTime as number) - (a.activeTime as number))[0]?.name ?? null;

  const donationMap = new Map<string, number>();
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    donationMap.set(day.toDateString(), 0);
  }
  for (const donation of donations) {
    const key = new Date(donation.createdAt).toDateString();
    donationMap.set(key, (donationMap.get(key) || 0) + donation.amount);
  }

  const donationBars = Array.from(donationMap.entries()).map(([dateKey, amount]) => {
    const date = new Date(dateKey);
    return {
      day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      amount,
    };
  });

  const maxDonation = Math.max(...donationBars.map((item) => item.amount), 1);
  const weeklyTotal = donations.reduce((sum, d) => sum + d.amount, 0);

  const onlineDisplays = displays.filter((d) => d.status === "online");
  const offlineDisplays = displays.filter((d) => d.status !== "online");

  const actionCards = [
    {
      eyebrow: latestIqamah
        ? `Schedule from ${new Intl.DateTimeFormat("en-US").format(new Date(latestIqamah.changeDate))}`
        : "No iqamah schedule yet",
      title: "Update Iqamah Times",
      href: withMasjid("/dashboard/prayer-times", masjidId),
      icon: Clock3,
    },
    {
      eyebrow: `${contentCount} active content items`,
      title: "New Announcement",
      href: withMasjid("/dashboard/signage", masjidId),
      icon: Megaphone,
    },
    {
      eyebrow: `${donationCategoryCount} giving categories`,
      title: "Add Donation Category",
      href: withMasjid("/dashboard/donations/categories", masjidId),
      icon: Wallet,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#2e0c12]">Dashboard</h1>
          <p className="mt-0.5 text-sm text-[#8a7074]">
            {masjid.name} · {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(now)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-[#550C18]/15 text-[#550C18] hover:bg-[#550C18]/5 self-start sm:self-auto"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export Report
        </Button>
      </div>

      {/* Quick action cards */}
      <section className="grid gap-3 sm:grid-cols-3">
        {actionCards.map((action) => (
          <Link key={action.title} href={action.href}>
            <Card className="overflow-hidden rounded-xl border border-[#550C18]/10 bg-white hover:border-[#550C18]/25 hover:shadow-sm transition-all duration-150">
              <CardContent className="p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#550C18]/8 text-[#550C18]">
                  <action.icon className="h-4.5 w-4.5" />
                </div>
                <p className="mt-4 text-xs text-[#8a7074]">{action.eyebrow}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-[#2e0c12]">{action.title}</h2>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-[#c9b5bb]" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {/* Prayer times + donations */}
      <section className="grid gap-5 xl:grid-cols-[300px_1fr]">
        {/* Prayer times */}
        <Card className="rounded-xl border border-[#550C18]/10 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-[#550C18]/8 p-1.5 text-[#550C18]">
                  <Clock3 className="h-4 w-4" />
                </div>
                <p className="font-semibold text-[#2e0c12]">Prayer Times</p>
              </div>
              <Badge className="bg-[#550C18]/8 text-[#550C18] hover:bg-[#550C18]/8 text-xs font-medium">
                {todayPrayerTime ? "Today" : "No data"}
              </Badge>
            </div>

            <div className="space-y-2">
              {prayerItems.map((prayer) => (
                <div
                  key={prayer.name}
                  className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 transition-colors ${
                    prayer.name === activePrayerName
                      ? "bg-[#550C18] text-white"
                      : "bg-[#fdf8f8] text-[#2e0c12] border border-[#550C18]/8"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold">{prayer.name}</span>
                    {prayer.name === activePrayerName && (
                      <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                        Now
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{prayer.adhan}</p>
                    <p className={`text-[11px] ${prayer.name === activePrayerName ? "text-white/70" : "text-[#8a7074]"}`}>
                      Iqamah {prayer.iqamah}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link href={withMasjid("/dashboard/prayer-times", masjidId)}>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full border-[#550C18]/15 text-[#550C18] hover:bg-[#550C18]/5 text-xs"
              >
                Manage Prayer Times
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Donations chart */}
        <Card className="rounded-xl border border-[#550C18]/10 bg-white">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="font-semibold text-[#2e0c12]">Weekly Donations</p>
                <p className="text-sm text-[#8a7074] mt-0.5">
                  Total:{" "}
                  <span className="font-semibold text-[#550C18]">
                    {formatCurrency(weeklyTotal)}
                  </span>
                </p>
              </div>
              <span className="text-xs text-[#8a7074] bg-[#fdf8f8] border border-[#550C18]/8 rounded-md px-2.5 py-1">
                Last 7 days
              </span>
            </div>

            <div className="mt-6 flex h-52 items-end gap-2">
              {donationBars.map((item, index) => (
                <div
                  key={item.day}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="w-full flex flex-col justify-end" style={{ height: "160px" }}>
                    <div
                      className={`w-full rounded-t-md ${
                        index === donationBars.length - 2
                          ? "bg-[#550C18]"
                          : "bg-[#e8d5da]"
                      }`}
                      style={{
                        height: `${Math.max(4, (item.amount / maxDonation) * 160)}px`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] font-medium text-[#8a7074]">{item.day}</p>
                  {item.amount > 0 && (
                    <p className="text-[10px] text-[#6d5560]">{formatCurrency(item.amount)}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* TV displays + events */}
      <section className="grid gap-5 xl:grid-cols-[300px_1fr]">
        {/* TV Display status */}
        <Card className="rounded-xl border border-[#550C18]/10 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-[#550C18]/8 p-1.5 text-[#550C18]">
                  <Monitor className="h-4 w-4" />
                </div>
                <p className="font-semibold text-[#2e0c12]">TV Displays</p>
              </div>
              <span className="text-xs text-[#8a7074]">{displays.length} total</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3 rounded-lg border border-emerald-200/60 bg-emerald-50 p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <Monitor className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-emerald-800">
                    {onlineDisplays.length} Online
                  </p>
                  <p className="text-xs text-emerald-700/70 truncate">
                    {onlineDisplays.length > 0
                      ? onlineDisplays.slice(0, 3).map((d) => d.location || d.name).join(", ")
                      : "No active displays"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-red-200/60 bg-red-50 p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500 text-white">
                  <Monitor className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-red-700">
                    {offlineDisplays.length} Offline
                  </p>
                  <p className="text-xs text-red-600/70 truncate">
                    {offlineDisplays.length > 0
                      ? offlineDisplays.slice(0, 2).map((d) => d.location || d.name).join(", ")
                      : "All displays are online"}
                  </p>
                </div>
              </div>
            </div>

            <Link href={withMasjid("/dashboard/signage", masjidId)}>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full border-[#550C18]/15 text-[#550C18] hover:bg-[#550C18]/5 text-xs"
              >
                Manage Displays
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming events */}
        <Card className="rounded-xl border border-[#550C18]/10 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-[#550C18]/8 p-1.5 text-[#550C18]">
                  <Calendar className="h-4 w-4" />
                </div>
                <p className="font-semibold text-[#2e0c12]">Upcoming Events</p>
              </div>
              <Link
                href={withMasjid("/dashboard/events", masjidId)}
                className="text-xs font-medium text-[#550C18] hover:text-[#3d0912]"
              >
                View all →
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {events.length > 0 ? (
                events.map((event) => (
                  <Link
                    key={event.id}
                    href={withMasjid("/dashboard/events", masjidId)}
                    className="group rounded-xl border border-[#550C18]/8 bg-[#fdf8f8] overflow-hidden hover:border-[#550C18]/20 transition-colors"
                  >
                    <div
                      className="h-28 bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${getEventImage(event)})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute left-2.5 top-2.5 rounded-md bg-white/90 px-2 py-0.5 text-xs font-semibold text-[#550C18]">
                        {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(event.date))}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-[#2e0c12] line-clamp-1">{event.title}</h3>
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#8a7074]">
                        <Calendar className="h-3 w-3" />
                        {formatTime(event.date, timezone)}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-3 rounded-xl border border-dashed border-[#550C18]/15 bg-[#fdf8f8] p-8 text-center text-sm text-[#8a7074]">
                  No upcoming events. Add the next community program.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
