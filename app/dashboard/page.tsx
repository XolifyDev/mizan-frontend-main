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
      <div className="rounded-[28px] border border-[#550C18]/10 bg-white p-8 shadow-[0_24px_60px_-45px_rgba(85,12,24,0.45)]">
        <h1 className="text-3xl font-semibold text-[#2e0c12]">Dashboard Overview</h1>
        <p className="mt-2 text-[#6d5560]">
          Select a masjid to load live operations and community metrics.
        </p>
      </div>
    );
  }

  const masjid = await getUserMasjid(masjidId);

  if (!masjid || ("error" in masjid && masjid.error)) {
    return (
      <div className="rounded-[28px] border border-[#550C18]/10 bg-white p-8 shadow-[0_24px_60px_-45px_rgba(85,12,24,0.45)]">
        <h1 className="text-3xl font-semibold text-[#2e0c12]">Dashboard Overview</h1>
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
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),
    prisma.iqamahTiming.findFirst({
      where: {
        masjidId,
        changeDate: {
          lte: now,
        },
      },
      orderBy: {
        changeDate: "desc",
      },
    }),
    prisma.donation.findMany({
      where: {
        masjidId,
        createdAt: {
          gte: weekStart,
        },
        status: {
          not: "failed",
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.tVDisplay.findMany({
      where: { masjidId },
      select: {
        id: true,
        name: true,
        location: true,
        status: true,
        lastSeen: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.event.findMany({
      where: {
        masjidId,
        date: {
          gte: now,
        },
      },
      select: {
        id: true,
        title: true,
        date: true,
        flyerUrl: true,
        tvFlyerUrl: true,
      },
      orderBy: {
        date: "asc",
      },
      take: 3,
    }),
    prisma.content.count({
      where: {
        masjidId,
        active: true,
      },
    }),
    prisma.donationCategory.count({
      where: {
        masjidId,
        active: true,
      },
    }),
  ]);

  const prayerItems = prayerOrder.map((name, index) => {
    const adhanTime =
      todayPrayerTime?.[prayerTimeFieldMap[name]] ?? null;

    const prayerTimeIqamah =
      todayPrayerTime?.[prayerIqamahFieldMap[name]] ?? null;

    const scheduleIqamahRaw =
      latestIqamah?.[iqamahScheduleFieldMap[name]] ?? null;

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
      current:
        !!activeTime &&
        now.getTime() >= new Date(activeTime).getTime() &&
        (!nextPrayerTime || now.getTime() < new Date(nextPrayerTime).getTime()),
    };
  });

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
  const weeklyTotal = donations.reduce((sum, donation) => sum + donation.amount, 0);

  const onlineDisplays = displays.filter((display) => display.status === "online");
  const offlineDisplays = displays.filter((display) => display.status !== "online");

  const actionCards = [
    {
      eyebrow: latestIqamah
        ? `Current schedule from ${new Intl.DateTimeFormat("en-US").format(new Date(latestIqamah.changeDate))}`
        : "No iqamah schedule yet",
      title: "Update Iqamah Times",
      href: withMasjid("/dashboard/prayer-times", masjidId),
      icon: Clock3,
      tone:
        "bg-gradient-to-br from-[#550C18] via-[#6d1021] to-[#8a1830] text-white shadow-[0_24px_50px_-24px_rgba(85,12,24,0.8)]",
      iconTone: "bg-white/10 text-white",
    },
    {
      eyebrow: `${contentCount} active content items`,
      title: "New Announcement",
      href: withMasjid("/dashboard/signage", masjidId),
      icon: Megaphone,
      tone:
        "bg-white text-[#2e0c12] border border-[#550C18]/10 shadow-[0_20px_45px_-30px_rgba(85,12,24,0.35)]",
      iconTone: "bg-[#550C18]/8 text-[#550C18]",
    },
    {
      eyebrow: `${donationCategoryCount} active giving categories`,
      title: "Add Donation Category",
      href: withMasjid("/dashboard/donations/categories", masjidId),
      icon: Wallet,
      tone:
        "bg-gradient-to-br from-[#7b1528] via-[#8f1930] to-[#a2203a] text-white shadow-[0_24px_50px_-24px_rgba(122,21,40,0.8)]",
      iconTone: "bg-white/10 text-white",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#550C18]/10 bg-[linear-gradient(135deg,rgba(255,246,247,1)_0%,rgba(255,255,255,1)_42%,rgba(249,241,243,1)_100%)] p-6 shadow-[0_30px_80px_-55px_rgba(85,12,24,0.45)] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-1xl font-semibold tracking-tight text-[#2e0c12]">
              Dashboard Overview
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-[#6d5560] md:text-base">
              Live masjid operations and community metrics for {masjid.name}.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-[#550C18]/15 bg-white/90 text-[#550C18] hover:bg-[#550C18]/5"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {actionCards.map((action) => (
          <Link key={action.title} href={action.href}>
            <Card
              className={`overflow-hidden border-none rounded-[26px] ${action.tone} transition duration-200 hover:-translate-y-0.5`}
            >
              <CardContent className="p-5">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${action.iconTone}`}
                >
                  <action.icon className="h-6 w-6" />
                </div>
                <p className="mt-6 text-sm font-medium opacity-75">
                  {action.eyebrow}
                </p>
                <div className="mt-1 flex items-end justify-between gap-4">
                  <h2 className="text-lg font-semibold leading-tight">
                    {action.title}
                  </h2>
                  <ArrowUpRight className="h-5 w-5 shrink-0 opacity-70" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="rounded-[28px] border-[#550C18]/10 bg-white shadow-[0_24px_60px_-45px_rgba(85,12,24,0.45)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-[#550C18]/8 p-2 text-[#550C18]">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#2e0c12]">
                    Prayer Times
                  </p>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8a6b74]">
                    Today
                  </p>
                </div>
              </div>
              <Badge className="bg-[#550C18]/8 text-[#550C18] hover:bg-[#550C18]/8">
                {todayPrayerTime ? "Live" : "Pending"}
              </Badge>
            </div>

            <div className="mt-5 space-y-3">
              {prayerItems.map((prayer) => (
                <div
                  key={prayer.name}
                  className={`rounded-2xl border px-4 py-3 transition ${
                    prayer.current
                      ? "border-[#550C18] bg-[#550C18] text-white shadow-[0_18px_40px_-25px_rgba(85,12,24,0.85)]"
                      : "border-[#550C18]/8 bg-[#faf7f8] text-[#2e0c12]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{prayer.name}</span>
                      {prayer.current ? (
                        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]">
                          Current
                        </span>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{prayer.adhan}</p>
                      <p
                        className={`text-xs ${
                          prayer.current ? "text-white/75" : "text-[#8a6b74]"
                        }`}
                      >
                        Iqamah: {prayer.iqamah}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-[#550C18]/10 bg-white shadow-[0_24px_60px_-45px_rgba(85,12,24,0.45)]">
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-2xl font-semibold text-[#2e0c12]">
                  Weekly Donations Trend
                </p>
                <p className="mt-1 text-sm text-[#8a6b74]">
                  Total this week:{" "}
                  <span className="font-semibold text-[#550C18]">
                    {formatCurrency(weeklyTotal)}
                  </span>
                </p>
              </div>
              <Button
                variant="outline"
                className="border-[#550C18]/10 bg-[#faf7f8] text-[#6d5560] hover:bg-[#550C18]/5"
              >
                Last 7 Days
              </Button>
            </div>

            <div className="mt-10 flex h-[320px] items-end justify-between gap-3 rounded-[24px] border border-dashed border-[#550C18]/10 bg-[linear-gradient(180deg,rgba(255,248,249,0.45)_0%,rgba(255,255,255,1)_100%)] px-3 pb-6 pt-10">
              {donationBars.map((item, index) => (
                <div
                  key={item.day}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                >
                  <div className="w-full rounded-full bg-[#f3eaed]">
                    <div
                      className={`mx-auto w-full rounded-full ${
                        index === donationBars.length - 2
                          ? "bg-gradient-to-t from-[#550C18] to-[#8f1930]"
                          : "bg-gradient-to-t from-[#7f2233] to-[#cfa1ad]"
                      }`}
                      style={{
                        height: `${Math.max(
                          20,
                          (item.amount / maxDonation) * 220
                        )}px`,
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6b74]">
                      {item.day}
                    </p>
                    <p className="mt-1 text-xs text-[#6d5560]">
                      {item.amount > 0 ? formatCurrency(item.amount) : "$0.00"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="rounded-[28px] border-[#550C18]/10 bg-white shadow-[0_24px_60px_-45px_rgba(85,12,24,0.45)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[#2e0c12]">
                  TV Display Status
                </h2>
                <p className="mt-1 text-sm text-[#8a6b74]">
                  Real-time health across connected screens
                </p>
              </div>
              <div className="rounded-xl bg-[#550C18]/8 p-2 text-[#550C18]">
                <Monitor className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50 p-4 text-emerald-800">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                    <Monitor className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {onlineDisplays.length} Online
                    </p>
                    <p className="mt-1 text-xs leading-5 opacity-80">
                      {onlineDisplays.length > 0
                        ? onlineDisplays
                            .slice(0, 3)
                            .map((display) => display.location || display.name)
                            .join(", ")
                        : "No active displays reporting in."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-red-200/70 bg-red-50 p-4 text-red-700">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white">
                    <Monitor className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {offlineDisplays.length} Offline
                    </p>
                    <p className="mt-1 text-xs leading-5 opacity-80">
                      {offlineDisplays.length > 0
                        ? offlineDisplays
                            .slice(0, 2)
                            .map((display) => display.location || display.name)
                            .join(", ")
                        : "All displays are currently online."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Link href={withMasjid("/dashboard/signage", masjidId)}>
              <Button
                variant="outline"
                className="mt-5 w-full border-dashed border-[#550C18]/25 text-[#550C18] hover:bg-[#550C18]/5"
              >
                Manage All Displays
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-[#550C18]/10 bg-white shadow-[0_24px_60px_-45px_rgba(85,12,24,0.45)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[#2e0c12]">
                  Upcoming Events
                </h2>
                <p className="mt-1 text-sm text-[#8a6b74]">
                  What your community will see next
                </p>
              </div>
              <Link
                href={withMasjid("/dashboard/events", masjidId)}
                className="text-sm font-medium text-[#550C18] hover:text-[#78001A]"
              >
                View Calendar
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {events.length > 0 ? (
                events.map((event) => (
                  <Link
                    key={event.id}
                    href={withMasjid("/dashboard/events", masjidId)}
                    className="group rounded-[24px] border border-[#550C18]/8 bg-[#fcfafb] p-3 transition hover:-translate-y-0.5 hover:border-[#550C18]/20 hover:shadow-[0_18px_40px_-28px_rgba(85,12,24,0.35)]"
                  >
                    <div
                      className="relative h-36 overflow-hidden rounded-2xl bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${getEventImage(event)})`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                      <div className="absolute left-3 top-3 rounded-xl bg-white/90 px-2 py-1 text-xs font-semibold text-[#550C18] shadow-sm">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                        }).format(new Date(event.date))}
                      </div>
                    </div>
                    <div className="pt-4">
                      <h3 className="text-lg font-semibold leading-snug text-[#2e0c12]">
                        {event.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-2 text-sm text-[#8a6b74]">
                        <Calendar className="h-4 w-4" />
                        <span>{formatTime(event.date, timezone)}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-[#550C18]/15 bg-[#fcfafb] p-8 text-sm text-[#8a6b74] md:col-span-3">
                  No upcoming events yet. Add the next community program to make
                  it visible here.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
