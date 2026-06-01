import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db";
import { getUserMasjid } from "@/lib/actions/masjid";
import { z } from "zod";

const kioskConfigSchema = z.object({
  layout: z.string().min(1, "Layout is required"),
  color: z.string().min(1, "Color is required"),
  timeout: z.coerce.number().int().positive("Timeout must be greater than 0"),
  categories: z.array(z.string().min(1)).min(1, "At least one category is required"),
});

const kioskPatchSchema = z.object({
  kioskId: z.string().min(1, "kioskId is required"),
  config: kioskConfigSchema,
});

// POST /api/kiosk-instances
export async function POST() {
  return NextResponse.json(
    {
      error: true,
      message: "Kiosk instances are provisioned through the admin app, not this dashboard.",
    },
    { status: 403 }
  );
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
  } catch {
    return NextResponse.json({ error: true, message: "Failed to fetch kiosk instances" }, { status: 500 })
  }
}

// PATCH /api/kiosk-instances
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = kioskPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: true, message: parsed.error.issues[0]?.message || "Invalid kiosk config payload" },
        { status: 400 }
      );
    }
    const { kioskId, config } = parsed.data;
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
  } catch {
    return NextResponse.json({ error: true, message: "Failed to update kiosk config" }, { status: 500 });
  }
} 
