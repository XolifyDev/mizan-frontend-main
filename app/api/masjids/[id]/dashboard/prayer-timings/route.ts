import { NextRequest, NextResponse } from "next/server";

import { getUserMasjid } from "@/lib/actions/masjid";
import { fetchPrayerTimings } from "@/lib/actions/prayer-times";

export const GET = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const masjid = await getUserMasjid(id);
  if (!masjid || (typeof masjid === "object" && "error" in masjid)) {
    const status = masjid && "error" in masjid ? 401 : 404;
    const message = status === 401 ? "Unauthorized" : "Masjid not found";
    return NextResponse.json({ error: message }, { status });
  }
  const prayerTimings = await fetchPrayerTimings(id);
  return NextResponse.json(prayerTimings);
};
