"use server";

import { NextRequest, NextResponse } from "next/server";

import { getUserMasjid } from "@/lib/actions/masjid";
import { prisma } from "@/lib/db";
import { fetchPrayerTimings } from "@/lib/actions/prayer-times";

export const GET = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const masjid = await getUserMasjid(id);
  if (!masjid) {
    return NextResponse.json({ error: "Masjid not found" }, { status: 404 });
  }
  const prayerTimings = await fetchPrayerTimings(id);
  return NextResponse.json(prayerTimings);
};