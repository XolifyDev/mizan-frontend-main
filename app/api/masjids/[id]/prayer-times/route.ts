"use server";

import { getMasjidById } from "@/lib/actions/masjids";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const masjid = await getMasjidById(id);
    
    // Get today's prayer times
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const prayerTimes = await prisma.prayerTime.findFirst({
      where: {
        masjidId: id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get today's iqamah timing (most recent one that's <= today)
    const todayIqamah = await prisma.iqamahTiming.findFirst({
      where: {
        masjidId: id,
        changeDate: {
          lte: today,
        },
      },
      orderBy: {
        changeDate: "desc",
      },
    });
    
    // If no masjid found, return sample data for testing
    if (!masjid) {
      const sampleMasjid = {
        id: id,
        name: "Sample Masjid",
        address: "123 Main Street",
        logo: null
      };
      
      const samplePrayerTimes = {
        fajr: "2024-01-01T05:30:00Z",
        iqamahFajr: "2024-01-01T05:45:00Z",
        sunrise: "2024-01-01T07:00:00Z",
        dhuhr: "2024-01-01T12:30:00Z",
        iqamahDhuhr: "2024-01-01T12:45:00Z",
        asr: "2024-01-01T15:30:00Z",
        iqamahAsr: "2024-01-01T15:45:00Z",
        maghrib: "2024-01-01T18:00:00Z",
        iqamahMaghrib: "2024-01-01T18:15:00Z",
        isha: "2024-01-01T19:30:00Z",
        iqamahIsha: "2024-01-01T19:45:00Z"
      };
      
      return NextResponse.json({ masjid: sampleMasjid, prayerTimes: samplePrayerTimes });
    }

    // If we have prayer times but no iqamah times in the database, 
    // or if the iqamah times in prayer times are null, use the iqamah timing
    let finalPrayerTimes = prayerTimes;
    
    if (prayerTimes && todayIqamah) {
      // Helper function to convert time string to Date object
      function convertTimeStringToDate(timeStr: string, baseDate: Date) {
        if (!timeStr) return null;
        // Normalize: "5:50am" -> "5:50 am"
        const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*([aApP][mM])$/) ||
                      timeStr.match(/^(\d{1,2}):(\d{2})\s*([aApP][mM])/) ||
                      timeStr.match(/^(\d{1,2}):(\d{2})\s*([aApP][mM])?$/);
      
        if (!match) return null;
        let [, hourStr, minStr, period] = match;
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minStr, 10);
      
        if (period) {
          period = period.toLowerCase();
          if (period === 'pm' && hour < 12) hour += 12;
          if (period === 'am' && hour === 12) hour = 0;
        }
      
        const date = new Date(baseDate);
        date.setHours(hour, minute, 0, 0);
        return date;
      }
      // Helper to safely convert to ISO string
      const toIsoOrNull = (date: Date | null) => (date instanceof Date && !isNaN(date.getTime()) ? date.toISOString() : null);


      // If prayer times don't have iqamah times, add them from today's iqamah timing
      finalPrayerTimes = {
        ...prayerTimes,
        iqamahFajr: toIsoOrNull(convertTimeStringToDate(todayIqamah.fajr, today)),
        iqamahDhuhr: toIsoOrNull(convertTimeStringToDate(todayIqamah.dhuhr, today)),
        iqamahAsr: toIsoOrNull(convertTimeStringToDate(todayIqamah.asr, today)),
        iqamahMaghrib: toIsoOrNull(convertTimeStringToDate(todayIqamah.maghrib, today)),
        iqamahIsha: toIsoOrNull(convertTimeStringToDate(todayIqamah.isha, today)),
        iqamahJumuahI: todayIqamah.jumuahI ? toIsoOrNull(convertTimeStringToDate(todayIqamah.jumuahI, today)) : null,
        iqamahJumuahII: todayIqamah.jumuahII ? toIsoOrNull(convertTimeStringToDate(todayIqamah.jumuahII, today)) : null,
        iqamahJumuahIII: todayIqamah.jumuahIII ? toIsoOrNull(convertTimeStringToDate(todayIqamah.jumuahIII, today)) : null,
      };
    }
    
    return NextResponse.json({ masjid, prayerTimes: finalPrayerTimes });
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prayer times' },
      { status: 500 }
    );
  }
}