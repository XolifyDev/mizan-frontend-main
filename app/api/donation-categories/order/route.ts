import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/actions/user";

export async function PUT(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { categories } = body;

    if (!Array.isArray(categories)) {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    // Update each category's order
    await Promise.all(
      categories.map((category, index) =>
        prisma.donationCategory.update({
          where: {
            id: category.id,
            masjidId: user.masjidId, // Ensure category belongs to user's masjid
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