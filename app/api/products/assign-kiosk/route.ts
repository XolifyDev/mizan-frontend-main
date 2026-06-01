import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUser } from "@/lib/actions/user"
import { z } from "zod"

const assignKioskSchema = z.object({
  kioskId: z.string().min(1, "kioskId is required"),
  masjidId: z.string().min(1, "masjidId is required"),
});

// POST /api/products/assign-kiosk
export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user || !user.admin) {
      return NextResponse.json({ error: true, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json()
    const parsed = assignKioskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: true, message: parsed.error.issues[0]?.message || "Invalid kiosk assignment payload" },
        { status: 400 }
      );
    }

    const { kioskId, masjidId } = parsed.data

    const [product, masjid] = await Promise.all([
      prisma.product.findUnique({
        where: { id: kioskId },
        select: { id: true, type: true },
      }),
      prisma.masjid.findUnique({
        where: { id: masjidId },
        select: { id: true },
      }),
    ]);

    if (!product || product.type !== "kiosk") {
      return NextResponse.json({ error: true, message: "Kiosk product not found" }, { status: 404 });
    }
    if (!masjid) {
      return NextResponse.json({ error: true, message: "Masjid not found" }, { status: 404 });
    }

    // Create or update the assignment
    const assignment = await prisma.masjidProduct.upsert({
      where: {
        masjidId_productId: {
          masjidId,
          productId: kioskId,
        },
      },
      update: { assignedAt: new Date() },
      create: {
        masjidId,
        productId: kioskId,
      },
    })
    return NextResponse.json({ success: true, assignment })
  } catch (error) {
    console.error("[ASSIGN_KIOSK_POST]", error);
    return NextResponse.json({ error: true, message: "Failed to assign kiosk" }, { status: 500 })
  }
} 
