import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserMasjid } from "@/lib/actions/masjid";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data?.masjidId) {
      return NextResponse.json(
        { error: "masjidId is required" },
        { status: 400 }
      );
    }
    const masjid = await getUserMasjid(data.masjidId);
    if (!masjid || (typeof masjid === "object" && "error" in masjid)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const donation = await prisma.donation.create({
      data: {
        ...data,
        status: "pending",
      },
      include: {
        masjid: true,
        category: true,
      },
    });

    return NextResponse.json(donation);
  } catch (error) {
    console.error("Error creating donation:", error);
    return NextResponse.json(
      { error: "Failed to create donation" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const masjidId = searchParams.get("masjidId");
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get("pageSize") || "10", 10) || 10, 1),
      50
    );

    if (!masjidId) {
      return NextResponse.json(
        { error: "masjidId is required" },
        { status: 400 }
      );
    }
    const masjid = await getUserMasjid(masjidId);
    if (!masjid || (typeof masjid === "object" && "error" in masjid)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where = {
      masjidId,
      ...(categoryId && { categoryId }),
      ...(status && { status }),
    };

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        include: {
          masjid: {
            select: {
              name: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.donation.count({ where }),
    ]);

    return NextResponse.json({ donations, total, page, pageSize });
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}
