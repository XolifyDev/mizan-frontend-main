import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserMasjid } from "@/lib/actions/masjid";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { categories, masjidId } = body;

    if (!masjidId) {
      return new NextResponse("Missing masjidId", { status: 400 });
    }
    if (!Array.isArray(categories)) {
      return new NextResponse("Invalid request body", { status: 400 });
    }
    if (!categories.every((category) => category && category.id)) {
      return new NextResponse("Invalid category data", { status: 400 });
    }
    const masjid = await getUserMasjid(masjidId);
    if (!masjid || !("id" in masjid)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ids = categories.map((category) => category.id);
    const existing = await prisma.donationCategory.findMany({
      where: { id: { in: ids }, masjidId },
      select: { id: true },
    });
    if (existing.length !== ids.length) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update each category's order
    await Promise.all(
      categories.map((category, index) =>
        prisma.donationCategory.update({
          where: {
            id: category.id,
          },
          data: {
            order: index,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DONATION_CATEGORIES_ORDER_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 
