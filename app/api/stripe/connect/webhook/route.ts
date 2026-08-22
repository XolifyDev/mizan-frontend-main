import { NextRequest, NextResponse } from "next/server";
import { stripeClient } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_CONNECT_WEBHOOK_SECRET!
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  if (event.type === "account.updated") {
    const account = event.data.object as any;
    const masjidId = account.metadata?.masjidId;
    if (masjidId) {
      const status =
        account.charges_enabled && account.payouts_enabled
          ? "active"
          : account.details_submitted
            ? "pending"
            : "onboarding";

      await prisma.masjid.updateMany({
        where: { stripeAccountId: account.id },
        data: { stripeAccountStatus: status },
      });
    }
  }

  return NextResponse.json({ received: true });
}
