import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripeClient } from "@/lib/stripe";
import { prisma } from "@/lib/db";

/**
 * Stripe webhook for the Mizan Pro subscription (money FROM the masjid).
 *
 * Separate endpoint and separate signing secret from the Connect webhook
 * (money TO the masjid) — they are different Stripe objects with different
 * lifecycles, and sharing a handler invites mixing them up.
 */

/** Statuses that should keep Pro unlocked. */
const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

async function applySubscription(subscription: Stripe.Subscription) {
  // Prefer the metadata we stamped at checkout; fall back to the customer.
  const masjidId = subscription.metadata?.masjidId;

  const where = masjidId
    ? { id: masjidId }
    : { billingCustomerId: subscription.customer as string };

  const isActive = ACTIVE_STATUSES.has(subscription.status);
  const periodEnd = (subscription as any).current_period_end as
    | number
    | undefined;

  await prisma.masjid.updateMany({
    where,
    data: {
      plan: isActive ? "PRO" : "FREE",
      planStatus: subscription.status,
      stripeSubscriptionId: subscription.id,
      planCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET!
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;

        // Re-fetch rather than trusting the thin session object.
        const subscription = await stripeClient.subscriptions.retrieve(
          session.subscription as string
        );
        // Checkout carries the masjidId even when subscription_data didn't
        // propagate it, so backfill before applying.
        if (!subscription.metadata?.masjidId && session.metadata?.masjidId) {
          subscription.metadata = {
            ...subscription.metadata,
            masjidId: session.metadata.masjidId,
          };
        }
        await applySubscription(subscription);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await applySubscription(event.data.object as Stripe.Subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          const subscription = await stripeClient.subscriptions.retrieve(
            invoice.subscription as string
          );
          await applySubscription(subscription);
        }
        break;
      }

      default:
        break;
    }
  } catch (e: any) {
    // 500 so Stripe retries — a dropped event would leave the plan stale.
    console.error("[subscription webhook]", event.type, e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
