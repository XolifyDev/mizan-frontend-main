"use server";

import { getUserMasjid } from "@/lib/actions/masjid";
import { fetchPrayerCalculationSettings } from "@/lib/actions/prayer-times";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const masjid = await getUserMasjid(id);
  if (!masjid) {
    return NextResponse.json({ error: "Masjid not found" }, { status: 404 });
  }
  const prayerCalculations = await fetchPrayerCalculationSettings(id);
  return NextResponse.json(prayerCalculations);
};