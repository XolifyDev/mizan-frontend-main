"use server";

import { getMasjidById } from "@/lib/actions/masjids";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const masjid = await getMasjidById(id);

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const twoDaysAhead = new Date(today);
    twoDaysAhead.setDate(twoDaysAhead.getDate() + 2);

    const prayerTimes = await prisma.prayerTime.findFirst({
      where: { masjidId: id, date: { gte: today, lt: tomorrow } },
    });

    // Query up to 2 days ahead so timezone offsets don't miss today's record
    const todayIqamah = await prisma.iqamahTiming.findFirst({
      where: { masjidId: id, changeDate: { lte: twoDaysAhead } },
      orderBy: { changeDate: "desc" },
    });

    if (!masjid) {
      return NextResponse.json({
        masjid: { id, name: "Sample Masjid", address: "123 Main Street", logo: null },
        prayerTimes: {
          fajr: "2024-01-01T05:30:00Z", iqamahFajr: "2024-01-01T05:45:00Z",
          sunrise: "2024-01-01T07:00:00Z",
          dhuhr: "2024-01-01T12:30:00Z", iqamahDhuhr: "2024-01-01T12:45:00Z",
          asr: "2024-01-01T15:30:00Z", iqamahAsr: "2024-01-01T15:45:00Z",
          maghrib: "2024-01-01T18:00:00Z", iqamahMaghrib: "2024-01-01T18:15:00Z",
          isha: "2024-01-01T19:30:00Z", iqamahIsha: "2024-01-01T19:45:00Z",
        },
      });
    }

    // Convert a "05:50am" / "5:50 AM" / "17:50" string to a UTC ISO datetime,
    // interpreting the time in the masjid's local timezone.
    function iqamahStringToUTC(timeStr: string, tz: string): string | null {
      if (!timeStr || typeof timeStr !== 'string') return null;
      const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([aApP][mM])?$/);
      if (!match) return null;
      let hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      const period = match[3]?.toLowerCase();
      if (period === 'pm' && hour < 12) hour += 12;
      if (period === 'am' && hour === 12) hour = 0;

      // Get today's date string in the masjid timezone (YYYY-MM-DD)
      const todayStr = new Intl.DateTimeFormat('sv', { timeZone: tz }).format(now);

      // Construct a naïve UTC timestamp (hour:minute treated as UTC)
      const naiveUTC = new Date(
        `${todayStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`
      );

      // Find what local time naiveUTC shows in the masjid timezone
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
      }).formatToParts(naiveUTC);
      const shownHour = parseInt(parts.find(p => p.type === 'hour')?.value ?? '0', 10);
      const shownMin  = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0', 10);

      // Adjust so that naiveUTC maps to the correct UTC moment for the local time
      const diffMs = ((hour - shownHour) * 60 + (minute - shownMin)) * 60_000;
      return new Date(naiveUTC.getTime() + diffMs).toISOString();
    }

    let finalPrayerTimes: any = prayerTimes;

    if (prayerTimes && todayIqamah) {
      const tz = (masjid as any)?.timezone || 'UTC';
      const conv = (s: string) => iqamahStringToUTC(s, tz);
      finalPrayerTimes = {
        ...prayerTimes,
        iqamahFajr:    conv(todayIqamah.fajr)    || (prayerTimes as any).fajr,
        iqamahDhuhr:   conv(todayIqamah.dhuhr)   || (prayerTimes as any).dhuhr,
        iqamahAsr:     conv(todayIqamah.asr)      || (prayerTimes as any).asr,
        iqamahMaghrib: conv(todayIqamah.maghrib)  || (prayerTimes as any).maghrib,
        iqamahIsha:    conv(todayIqamah.isha)     || (prayerTimes as any).isha,
        iqamahJumuahI:   todayIqamah.jumuahI   ? conv(todayIqamah.jumuahI)   : null,
        iqamahJumuahII:  todayIqamah.jumuahII  ? conv(todayIqamah.jumuahII)  : null,
        iqamahJumuahIII: todayIqamah.jumuahIII ? conv(todayIqamah.jumuahIII) : null,
      };
    }

    return NextResponse.json({ masjid, prayerTimes: finalPrayerTimes });
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return NextResponse.json({ error: 'Failed to fetch prayer times' }, { status: 500 });
  }
}
