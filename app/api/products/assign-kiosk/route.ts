import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// POST /api/products/assign-kiosk
export async function POST(req: NextRequest) {
  try {
    const { kioskId, masjidId } = await req.json()
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
    return NextResponse.json({ error: true, message: "Failed to assign kiosk" }, { status: 500 })
  }
} 