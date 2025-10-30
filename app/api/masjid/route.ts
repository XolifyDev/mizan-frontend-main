import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/actions/user";
import { getUserMasjid } from "@/lib/actions/masjid";
import { prisma } from "@/lib/db";

// GET /api/masjid
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const single = searchParams.get('single');
    
    // If "single" query param is provided, return user's masjid
    if (single === 'true') {
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
    
    // Otherwise, return all masjids
    const masjids = await prisma.masjid.findMany();
    return NextResponse.json(masjids);
  } catch (error) {
    return NextResponse.json({ error: true, message: "Failed to fetch masjids" }, { status: 500 });
  }
} 