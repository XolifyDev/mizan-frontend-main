import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserMasjid } from "@/lib/actions/masjid";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const masjid = await getUserMasjid(id);

    if (!masjid || (typeof masjid === "object" && "error" in masjid)) {
      const status = masjid && "error" in masjid ? 401 : 404;
      return NextResponse.json(
        { success: false, error: status === 401 ? "Unauthorized" : "Masjid not found" },
        { status }
      );
    }

    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();

    const [totalAgg, donationCount, categoryGroups, kiosks, displays, websiteProducts, contentCount, eventCount, announcementCount] =
      await Promise.all([
        prisma.donation.aggregate({
          where: {
            masjidId: id,
            status: "completed",
            createdAt: { gte: fromDate, lte: toDate },
          },
          _sum: { amount: true },
        }),
        prisma.donation.count({
          where: {
            masjidId: id,
            status: "completed",
            createdAt: { gte: fromDate, lte: toDate },
          },
        }),
        prisma.donation.groupBy({
          by: ["categoryId"],
          where: {
            masjidId: id,
            status: "completed",
            createdAt: { gte: fromDate, lte: toDate },
          },
          _sum: { amount: true },
          _count: { _all: true },
        }),
        prisma.kioskInstance.findMany({
          where: { masjidId: id },
          select: { id: true, kioskName: true, status: true, kioskLocation: true },
        }),
        prisma.tVDisplay.findMany({
          where: { masjidId: id },
          select: { id: true, status: true },
        }),
        prisma.masjidProduct.findMany({
          where: { masjidId: id, product: { type: "website" } },
          include: { product: true },
        }),
        prisma.content.count({ where: { masjidId: id } }),
        prisma.event.count({ where: { masjidId: id, createdAt: { gte: fromDate, lte: toDate } } }),
        prisma.announcement.count({ where: { masjidId: id, createdAt: { gte: fromDate, lte: toDate } } }),
      ]);

    const categories = await prisma.donationCategory.findMany({
      where: { id: { in: categoryGroups.map((g) => g.categoryId) } },
      select: { id: true, name: true },
    });

    const categoryBreakdown = categoryGroups
      .map((group) => ({
        categoryId: group.categoryId,
        name: categories.find((c) => c.id === group.categoryId)?.name ?? "Unknown",
        amount: group._sum.amount ?? 0,
        count: group._count._all,
      }))
      .sort((a, b) => b.amount - a.amount);

    const kioskIds = kiosks.map((k) => k.id);
    const [kioskDonationAgg, kioskDonationCount, onlineDonationAgg, onlineDonationCount, byKioskGroups] = await Promise.all([
      prisma.donation.aggregate({
        where: {
          masjidId: id,
          status: "completed",
          createdAt: { gte: fromDate, lte: toDate },
          kioskInstanceId: { in: kioskIds.length ? kioskIds : ["__none__"] },
        },
        _sum: { amount: true },
      }),
      prisma.donation.count({
        where: {
          masjidId: id,
          status: "completed",
          createdAt: { gte: fromDate, lte: toDate },
          kioskInstanceId: { in: kioskIds.length ? kioskIds : ["__none__"] },
        },
      }),
      prisma.donation.aggregate({
        where: {
          masjidId: id,
          status: "completed",
          createdAt: { gte: fromDate, lte: toDate },
          kioskInstanceId: null,
        },
        _sum: { amount: true },
      }),
      prisma.donation.count({
        where: {
          masjidId: id,
          status: "completed",
          createdAt: { gte: fromDate, lte: toDate },
          kioskInstanceId: null,
        },
      }),
      prisma.donation.groupBy({
        by: ["kioskInstanceId"],
        where: {
          masjidId: id,
          status: "completed",
          createdAt: { gte: fromDate, lte: toDate },
          kioskInstanceId: { not: null },
        },
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

    const kioskMap = new Map(kiosks.map((k) => [k.id, k]));
    const topKiosks = byKioskGroups
      .map((k) => ({
        id: k.kioskInstanceId as string,
        name: kioskMap.get(k.kioskInstanceId as string)?.kioskName || "Unnamed kiosk",
        location: kioskMap.get(k.kioskInstanceId as string)?.kioskLocation || "",
        amount: k._sum.amount ?? 0,
        count: k._count._all,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const hasWebsite = Boolean(masjid.websiteUrl) || websiteProducts.length > 0;
    const activeDisplays = displays.filter((d) => d.status === "online").length;
    const activeKiosks = kiosks.filter((k) => k.status === "active").length;

    return NextResponse.json({
      success: true,
      data: {
        range: { from: fromDate.toISOString(), to: toDate.toISOString() },
        website: {
          hasWebsite,
          websiteUrl: masjid.websiteUrl || "",
          websiteProducts: websiteProducts.length,
        },
        donations: {
          totalAmount: totalAgg._sum.amount ?? 0,
          totalCount: donationCount,
          averageAmount: donationCount > 0 ? Math.round((totalAgg._sum.amount ?? 0) / donationCount) : 0,
          byCategory: categoryBreakdown,
          kioskAmount: kioskDonationAgg._sum.amount ?? 0,
          kioskCount: kioskDonationCount,
          onlineAmount: onlineDonationAgg._sum.amount ?? 0,
          onlineCount: onlineDonationCount,
        },
        kiosk: {
          hasKiosk: kiosks.length > 0,
          totalKiosks: kiosks.length,
          activeKiosks,
          inactiveKiosks: Math.max(0, kiosks.length - activeKiosks),
          topKiosks,
        },
        pageAnalytics: {
          eventsCreated: eventCount,
          announcementsCreated: announcementCount,
          contentItems: contentCount,
          totalDisplays: displays.length,
          activeDisplays,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to load analytics" },
      { status: 500 }
    );
  }
};
