import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserMasjid } from "@/lib/actions/masjid";
import { z } from "zod";

const donationCategorySchema = z.object({
  masjidId: z.string().min(1),
  name: z.string().trim().min(1, "Category name is required"),
  description: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  color: z.string().default("#550C18"),
  icon: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  featuredImage: z.string().optional().nullable(),
  showOnKiosk: z.boolean().default(true),
  excludeFromReceipts: z.boolean().default(false),
  allowPledge: z.boolean().default(false),
  quickDonate: z.boolean().default(false),
  hideTitle: z.boolean().default(false),
  showLogo: z.boolean().default(true),
  headerBgColor: z.string().optional().nullable(),
  allowComments: z.boolean().default(false),
  goalAmount: z.coerce.number().int().nullable().optional(),
  enableAppleGooglePay: z.boolean().default(false),
  intervals: z.array(z.string()).default([]),
  defaultInterval: z.string().optional().nullable(),
  defaultAmounts: z.string().optional().nullable(),
  recurringCountOptions: z.array(z.coerce.number().int()).default([]),
  ctaMessage: z.string().optional().nullable(),
  designations: z.array(z.string()).default([]),
  amountsPerInterval: z.record(z.string(), z.array(z.coerce.number())).optional().nullable(),
  allowCustomAmount: z.boolean().default(true),
  min: z.coerce.number().int().default(1),
  max: z.coerce.number().int().default(10000),
  enforceMax: z.boolean().default(false),
  coverFee: z.boolean().default(false),
  coverFeeDefault: z.boolean().default(false),
  customLabel: z.string().optional().nullable(),
  complianceText: z.string().optional().nullable(),
  allowAnonymous: z.boolean().default(false),
  collectAddress: z.boolean().default(false),
  collectPhone: z.boolean().default(false),
  mailingListOptIn: z.boolean().default(false),
  appreciation: z.string().optional().nullable(),
  redirectUrl: z.string().optional().nullable(),
  restricted: z.boolean().default(false),
  active: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
});

const donationCategoryPatchSchema = donationCategorySchema.partial().extend({
  id: z.string().min(1),
});

function validationErrorResponse(message: string) {
  return NextResponse.json({ error: "Validation error", message }, { status: 400 });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const masjidId = searchParams.get("masjidId");

    if (!masjidId) {
      return new NextResponse("Missing masjidId", { status: 400 });
    }

    const masjid = await getUserMasjid(masjidId);
    if (!masjid || !("id" in masjid)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (id) {
      // Fetch a single category
      const category = await prisma.donationCategory.findFirst({
        where: {
          id,
          masjidId: masjidId,
        },
      });
      if (!category) return new NextResponse("Not found", { status: 404 });
      return NextResponse.json(category);
    }

    // Otherwise, fetch all
    const categories = await prisma.donationCategory.findMany({
      where: {
        masjidId: masjidId,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[DONATION_CATEGORIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = donationCategorySchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message || "Invalid donation category data");
    }

    const {
      masjidId,
      ...categoryData
    } = parsed.data;

    if (!masjidId) {
      return new NextResponse("Missing masjidId", { status: 400 });
    }
    const masjid = await getUserMasjid(masjidId);
    if (!masjid || !("id" in masjid)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const category = await prisma.donationCategory.create({
      data: {
        ...categoryData,
        masjidId,
      },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error("[DONATION_CATEGORIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const parsed = donationCategoryPatchSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message || "Invalid donation category update");
    }

    const { id, ...data } = parsed.data;
    if (!id) return new NextResponse("Missing id", { status: 400 });

    const existing = await prisma.donationCategory.findUnique({
      where: { id },
      select: { masjidId: true },
    });
    if (!existing) return new NextResponse("Not found", { status: 404 });
    const masjid = await getUserMasjid(existing.masjidId);
    if (!masjid || !("id" in masjid)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    delete data.masjidId;
    const updated = await prisma.donationCategory.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[DONATION_CATEGORIES_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return new NextResponse("Missing id", { status: 400 });

    const existing = await prisma.donationCategory.findUnique({
      where: { id },
      select: { masjidId: true },
    });
    if (!existing) return new NextResponse("Not found", { status: 404 });
    const masjid = await getUserMasjid(existing.masjidId);
    if (!masjid || !("id" in masjid)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.donationCategory.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DONATION_CATEGORIES_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}   
