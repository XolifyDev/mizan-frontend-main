import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserMasjid } from "@/lib/actions/masjid";
import { z } from "zod";

const donationCreateSchema = z.object({
  masjidId: z.string().min(1, "masjidId is required"),
  categoryId: z.string().min(1, "categoryId is required"),
  amount: z.coerce.number().int().positive("Donation amount must be greater than 0"),
  donorName: z.string().optional().nullable(),
  donorEmail: z.string().email().optional().nullable().or(z.literal("")),
  kioskInstanceId: z.string().optional().nullable(),
  paymentMethod: z.string().min(1, "paymentMethod is required"),
  transactionId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = donationCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid donation payload" },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const masjid = await getUserMasjid(data.masjidId);
    if (!masjid || (typeof masjid === "object" && "error" in masjid)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const category = await prisma.donationCategory.findFirst({
      where: {
        id: data.categoryId,
        masjidId: data.masjidId,
        active: true,
      },
      select: {
        id: true,
        min: true,
        max: true,
        enforceMax: true,
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Donation category not found" }, { status: 404 });
    }
    if (data.amount < category.min) {
      return NextResponse.json({ error: `Minimum donation is ${category.min}` }, { status: 400 });
    }
    if (category.enforceMax && data.amount > category.max) {
      return NextResponse.json({ error: `Maximum donation is ${category.max}` }, { status: 400 });
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
