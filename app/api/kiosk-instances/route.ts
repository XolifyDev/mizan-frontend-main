import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db";
import { getUserMasjid } from "@/lib/actions/masjid";

// POST /api/kiosk-instances
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, masjidId, serial } = body
    if (!productId || !masjidId) {
      return NextResponse.json({ error: true, message: "Missing productId or masjidId" }, { status: 400 })
    }
    const masjid = await getUserMasjid(masjidId);
    if (!masjid || (typeof masjid === "object" && "error" in masjid)) {
      return NextResponse.json({ error: true, message: "Unauthorized" }, { status: 401 });
    }
    // Get amount of kiosks for this masjid
    const kioskCount = await prisma.kioskInstance.count({
      where: { masjidId },
    })
    const kioskInstance = await prisma.kioskInstance.create({
      data: {
        productId,
        masjidId,
        kioskName: `Kiosk ${kioskCount + 1}`,
        serial: serial || `KIOSK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      },
    })
    return NextResponse.json({ success: true, kioskInstance })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: true, message: "Failed to create kiosk instance" }, { status: 500 })
  }
}

// GET /api/kiosk-instances?masjidId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const masjidId = searchParams.get("masjidId")
  try {
    if (!masjidId) {
      return NextResponse.json({ error: true, message: "masjidId is required" }, { status: 400 });
    }
    const masjid = await getUserMasjid(masjidId);
    if (!masjid || (typeof masjid === "object" && "error" in masjid)) {
      return NextResponse.json({ error: true, message: "Unauthorized" }, { status: 401 });
    }
    const where = { masjidId }
    const kiosks = await prisma.kioskInstance.findMany({
      where,
      include: { product: true, masjid: true },
    })
    return NextResponse.json(kiosks || [])
  } catch (error) {
    return NextResponse.json({ error: true, message: "Failed to fetch kiosk instances" }, { status: 500 })
  }
}

// PATCH /api/kiosk-instances
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { kioskId, config } = body;
    if (!kioskId || !config) {
      return NextResponse.json({ error: true, message: "Missing kioskId or config" }, { status: 400 });
    }
    const existing = await prisma.kioskInstance.findUnique({
      where: { id: kioskId },
      select: { masjidId: true },
    });
    if (!existing) {
      return NextResponse.json({ error: true, message: "Kiosk not found" }, { status: 404 });
    }
    const masjid = await getUserMasjid(existing.masjidId);
    if (!masjid || (typeof masjid === "object" && "error" in masjid)) {
      return NextResponse.json({ error: true, message: "Unauthorized" }, { status: 401 });
    }
    const updated = await prisma.kioskInstance.update({
      where: { id: kioskId },
      data: { config },
    });
    return NextResponse.json({ success: true, kioskInstance: updated });
  } catch (error) {
    return NextResponse.json({ error: true, message: "Failed to update kiosk config" }, { status: 500 });
  }
} 
