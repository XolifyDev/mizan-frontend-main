import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/actions/user";
import { getUserMasjid } from "@/lib/actions/masjid";
import { prisma } from "@/lib/db";

// GET /api/masjid
export async function GET(req: NextRequest) {
  try {
    const masjids = await prisma.masjid.findMany();
    return NextResponse.json(masjids);
  } catch (error) {
    return NextResponse.json({ error: true, message: "Failed to fetch masjids" }, { status: 500 });
  }
}

export async function GET_single() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: true, message: "Not authenticated" }, { status: 401 });
  }
  const masjid = await getUserMasjid();
  if (!masjid || masjid.ownerId !== user.id) {
    return NextResponse.json({ error: true, message: "No masjid found or not authorized" }, { status: 403 });
  }
  return NextResponse.json(masjid);
} 