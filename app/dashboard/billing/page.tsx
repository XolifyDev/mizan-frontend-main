import { getUser } from "@/lib/actions/user";
import { prisma } from "@/lib/db";
import { stripeClient } from "@/lib/stripe";
import { BillingClient } from "./BillingClient";
import { PlanCard } from "@/components/PlanCard";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function BillingPage() {
  const user = await getUser();
  if (!user) redirect("/auth/signin");

  // Set by middleware.ts from the ?masjidId= query param.
  const masjidId = (await headers()).get("x-masjid-id");
  const masjid = masjidId
    ? await prisma.masjid.findUnique({
        where: { id: masjidId },
        select: {
          id: true,
          ownerId: true,
          plan: true,
          planStatus: true,
          planCurrentPeriodEnd: true,
        },
      })
    : null;

  // Orders from DB
  const orders = await prisma.orders.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Stripe data
  let subscriptions: any[] = [];
  let invoices: any[] = [];
  let paymentMethods: any[] = [];

  if (user.stripeCustomerId) {
    try {
      const [subRes, invRes, pmRes] = await Promise.all([
        stripeClient.subscriptions.list({ customer: user.stripeCustomerId, limit: 10 }),
        stripeClient.invoices.list({ customer: user.stripeCustomerId, limit: 20 }),
        stripeClient.paymentMethods.list({ customer: user.stripeCustomerId, type: "card" }),
      ]);
      subscriptions = subRes.data;
      invoices = invRes.data;
      paymentMethods = pmRes.data;
    } catch {
      // Stripe may not have this customer yet
    }
  }

  return (
    <>
      {masjid && (
        <div className="px-6 pt-6">
          <PlanCard
            masjidId={masjid.id}
            plan={masjid.plan}
            planStatus={masjid.planStatus}
            periodEnd={masjid.planCurrentPeriodEnd}
            isOwner={masjid.ownerId === user.id}
          />
        </div>
      )}
      <BillingClient
      orders={orders.map((o) => ({
        id: o.id,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        stripeSessionId: o.stripeSessionId ?? null,
        trackingNumber: o.trackingNumber ?? null,
        cart: o.cart,
        metaData: o.meta_data ?? null,
      }))}
      subscriptions={subscriptions.map((s) => ({
        id: s.id,
        status: s.status,
        currentPeriodEnd: s.current_period_end,
        cancelAtPeriodEnd: s.cancel_at_period_end,
        items: s.items.data.map((i: any) => ({
          id: i.id,
          name: i.price?.nickname || i.price?.product || "Plan",
          amount: i.price?.unit_amount ?? 0,
          currency: i.price?.currency ?? "usd",
          interval: i.price?.recurring?.interval ?? "month",
        })),
      }))}
      invoices={invoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        status: inv.status,
        total: inv.total,
        currency: inv.currency,
        created: inv.created,
        hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
        pdfUrl: inv.invoice_pdf ?? null,
      }))}
      paymentMethods={paymentMethods.map((pm) => ({
        id: pm.id,
        brand: pm.card?.brand ?? "card",
        last4: pm.card?.last4 ?? "••••",
        expMonth: pm.card?.exp_month ?? 0,
        expYear: pm.card?.exp_year ?? 0,
      }))}
      />
    </>
  );
}
