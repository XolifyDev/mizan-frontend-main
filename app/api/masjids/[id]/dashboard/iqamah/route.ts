import { getUserMasjid } from "@/lib/actions/masjid";
import { fetchIqamahTimings } from "@/lib/actions/prayer-times";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const masjid = await getUserMasjid(id);
  if (!masjid || (typeof masjid === "object" && "error" in masjid)) {
    const status = masjid && "error" in masjid ? 401 : 404;
    const message = status === 401 ? "Unauthorized" : "Masjid not found";
    return NextResponse.json({ error: message }, { status });
  }
  const iqamah = await fetchIqamahTimings(id);
  return NextResponse.json(iqamah);
};
