import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getUserMasjid } from "@/lib/actions/masjid";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const masjidId = searchParams.get("masjidId") || "";
  if (!masjidId) {
    return NextResponse.json({ error: "masjidId is required" }, { status: 400 });
  }
  const masjid = await getUserMasjid(masjidId);
  if (!masjid || (typeof masjid === "object" && "error" in masjid)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await prisma.orders.findMany({
    where: {
      masjidId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      masjid: true,
      user: true,
    },
  });
  return NextResponse.json(orders);
}
