import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserMasjid } from "@/lib/actions/masjid";

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
    const {
      masjidId,
      name,
      description,
      subtitle,
      color,
      icon,
      logo,
      featured,
      featuredImage,
      showOnKiosk,
      excludeFromReceipts,
      allowPledge,
      quickDonate,
      hideTitle,
      showLogo,
      headerBgColor,
      allowComments,
      goalAmount,
      enableAppleGooglePay,
      intervals,
      defaultInterval,
      defaultAmounts,
      recurringCountOptions,
      ctaMessage,
      designations,
      amountsPerInterval,
      allowCustomAmount,
      min,
      max,
      enforceMax,
      coverFee,
      coverFeeDefault,
      customLabel,
      complianceText,
      allowAnonymous,
      collectAddress,
      collectPhone,
      mailingListOptIn,
      appreciation,
      redirectUrl,
      restricted,
      active,
      order
    } = body;

    if (!masjidId) {
      return new NextResponse("Missing masjidId", { status: 400 });
    }
    const masjid = await getUserMasjid(masjidId);
    if (!masjid || !("id" in masjid)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const category = await prisma.donationCategory.create({
      data: {
        name,
        description,
        subtitle,
        color,
        icon,
        logo,
        featured,
        featuredImage,
        showOnKiosk,
        excludeFromReceipts,
        allowPledge,
        quickDonate,
        hideTitle,
        showLogo,
        headerBgColor,
        allowComments,
        goalAmount,
        enableAppleGooglePay,
        intervals,
        defaultInterval,
        recurringCountOptions,
        ctaMessage,
        designations,
        amountsPerInterval,
        allowCustomAmount,
        min,
        max,
        enforceMax,
        coverFee,
        coverFeeDefault,
        customLabel,
        complianceText,
        allowAnonymous,
        collectAddress,
        collectPhone,
        mailingListOptIn,
        appreciation,
        redirectUrl,
        restricted,
        active,
        order,
        defaultAmounts,
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
    const { id, ...data } = body;
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
