"use server";

import { getMasjidById } from "@/lib/actions/masjids";
import { getPrayerTimings } from "@/lib/actions/prayer-times";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const masjid = await getMasjidById(id);
    const prayerTimes = await getPrayerTimings(id);
    
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
        fajrIqamah: "2024-01-01T05:45:00Z",
        sunrise: "2024-01-01T07:00:00Z",
        dhuhr: "2024-01-01T12:30:00Z",
        dhuhrIqamah: "2024-01-01T12:45:00Z",
        asr: "2024-01-01T15:30:00Z",
        asrIqamah: "2024-01-01T15:45:00Z",
        maghrib: "2024-01-01T18:00:00Z",
        maghribIqamah: "2024-01-01T18:15:00Z",
        isha: "2024-01-01T19:30:00Z",
        ishaIqamah: "2024-01-01T19:45:00Z"
      };
      
      return NextResponse.json({ masjid: sampleMasjid, prayerTimes: samplePrayerTimes });
    }
    
    return NextResponse.json({ masjid, prayerTimes });
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prayer times' },
      { status: 500 }
    );
  }
}