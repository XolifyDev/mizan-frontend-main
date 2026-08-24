import { prisma } from "@/lib/db";
import { stripeClient } from "@/lib/stripe";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage() {
  const [
    totalUsers,
    totalMasjids,
    totalOrders,
    totalMizanTv,
    totalKiosks,
    totalTVDisplays,
    recentOrders,
    recentMasjids,
    onlineTVDisplays,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.masjid.count(),
    prisma.orders.count(),
    prisma.mizanTv.count(),
    prisma.kioskInstance.count(),
    prisma.tVDisplay.count(),
    prisma.orders.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true, email: true } }, masjid: { select: { name: true } } },
    }),
    prisma.masjid.findMany({
      orderBy: { id: "desc" },
      take: 6,
      select: { id: true, name: true, city: true, country: true, logo: true, email: true },
    }),
    prisma.tVDisplay.count({ where: { status: "online" } }),
  ]);

  // Revenue from Stripe — sum of succeeded payment intents (last 30 days)
  let totalRevenue = 0;
  let recentCharges: { id: string; amount: number; currency: string; created: number; description: string | null }[] = [];
  try {
    const charges = await stripeClient.paymentIntents.list({ limit: 50 });
    recentCharges = charges.data
      .filter((c) => c.status === "succeeded")
      .map((c) => ({ id: c.id, amount: c.amount, currency: c.currency, created: c.created, description: c.description }));
    totalRevenue = recentCharges.reduce((sum, c) => sum + c.amount, 0);
  } catch {}

  return (
    <AdminDashboardClient
      stats={{
        totalUsers,
        totalMasjids,
        totalOrders,
        totalMizanTv,
        totalKiosks,
        totalTVDisplays,
        onlineTVDisplays,
        totalRevenue,
      }}
      recentOrders={recentOrders.map((o) => ({
        id: o.id,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        cart: o.cart,
        user: o.user,
        masjid: o.masjid,
      }))}
      recentMasjids={recentMasjids}
      recentCharges={recentCharges}
    />
  );
}
