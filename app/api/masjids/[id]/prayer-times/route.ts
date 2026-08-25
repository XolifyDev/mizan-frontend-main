"use server";

import { getMasjidById } from "@/lib/actions/masjids";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const masjid = await getMasjidById(id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Use a wide window to find iqamah timing: up to 2 days ahead to handle
    // timezones where the stored changeDate midnight may be ahead of server UTC midnight
    const twoDaysAhead = new Date(today);
    twoDaysAhead.setDate(twoDaysAhead.getDate() + 2);

    const prayerTimes = await prisma.prayerTime.findFirst({
      where: {
        masjidId: id,
        date: { gte: today, lt: tomorrow },
      },
    });

    // Find the most recent iqamah timing that applies today.
    // Query up to 2 days ahead so timezone offsets don't miss today's record.
    const todayIqamah = await prisma.iqamahTiming.findFirst({
      where: {
        masjidId: id,
        changeDate: { lte: twoDaysAhead },
      },
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

    // Converts stored time strings ("05:30am", "5:30 AM", "17:30") to ISO on today's date.
    function convertTimeStringToDate(timeStr: string, baseDate: Date): Date | null {
      if (!timeStr || typeof timeStr !== 'string') return null;
      const cleaned = timeStr.trim();
      const match = cleaned.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([aApP][mM])?$/);
      if (!match) return null;
      let hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      const period = match[3]?.toLowerCase();
      if (period === 'pm' && hour < 12) hour += 12;
      if (period === 'am' && hour === 12) hour = 0;
      const date = new Date(baseDate);
      date.setHours(hour, minute, 0, 0);
      return date;
    }

    const toIso = (date: Date | null): string | null =>
      date instanceof Date && !isNaN(date.getTime()) ? date.toISOString() : null;

    let finalPrayerTimes: any = prayerTimes;

    if (prayerTimes && todayIqamah) {
      const conv = (s: string) => toIso(convertTimeStringToDate(s, today));
      finalPrayerTimes = {
        ...prayerTimes,
        // Use converted iqamah time; fall back to adhan time so client always gets a valid ISO string
        iqamahFajr:    conv(todayIqamah.fajr)    || (prayerTimes as any).fajr,
        iqamahDhuhr:   conv(todayIqamah.dhuhr)   || (prayerTimes as any).dhuhr,
        iqamahAsr:     conv(todayIqamah.asr)      || (prayerTimes as any).asr,
        iqamahMaghrib: conv(todayIqamah.maghrib)  || (prayerTimes as any).maghrib,
        iqamahIsha:    conv(todayIqamah.isha)     || (prayerTimes as any).isha,
        iqamahJumuahI:   todayIqamah.jumuahI   ? conv(todayIqamah.jumuahI)   : null,
        iqamahJumuahII:  todayIqamah.jumuahII  ? conv(todayIqamah.jumuahII)  : null,
        iqamahJumuahIII: todayIqamah.jumuahIII ? conv(todayIqamah.jumuahIII) : null,
        // Expose raw strings for debugging
        _debug: {
          rawFajr: todayIqamah.fajr, rawDhuhr: todayIqamah.dhuhr,
          rawAsr: todayIqamah.asr, rawMaghrib: todayIqamah.maghrib, rawIsha: todayIqamah.isha,
          changeDate: todayIqamah.changeDate,
        },
      };
    }

    return NextResponse.json({ masjid, prayerTimes: finalPrayerTimes });
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return NextResponse.json({ error: 'Failed to fetch prayer times' }, { status: 500 });
  }
}
