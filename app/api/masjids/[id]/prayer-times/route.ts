"use server";

import { getMasjidById } from "@/lib/actions/masjids";
import { getPrayerTimings } from "@/lib/actions/prayer-times";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const masjid = await getMasjidById(id);
  const prayerTimes = await getPrayerTimings(id);
  return NextResponse.json({ masjid, prayerTimes });
}