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

/**
 * Stripe moved `current_period_end` off the subscription and onto its items in
 * the 2025-03 API versions. Read whichever this account's version provides, so
 * the plan can't silently expire because the field was read from the wrong
 * place and came back undefined.
 */
function periodEndOf(subscription: Stripe.Subscription): number | undefined {
  const onSub = (subscription as any).current_period_end;
  if (typeof onSub === "number") return onSub;

  const ends = (subscription.items?.data ?? [])
    .map((i) => (i as any).current_period_end)
    .filter((v): v is number => typeof v === "number");

  return ends.length ? Math.max(...ends) : undefined;
}

async function applySubscription(subscription: Stripe.Subscription) {
  // Prefer the metadata we stamped at checkout; fall back to the customer.
  const masjidId = subscription.metadata?.masjidId;

  const where = masjidId
    ? { id: masjidId }
    : { billingCustomerId: subscription.customer as string };

  const isActive = ACTIVE_STATUSES.has(subscription.status);
  const periodEnd = periodEndOf(subscription);

  const result = await prisma.masjid.updateMany({
    where,
    data: {
      plan: isActive ? "PRO" : "FREE",
      planStatus: subscription.status,
      stripeSubscriptionId: subscription.id,
      planCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });

  // A webhook that matches no masjid is a silent payment failure: money taken,
  // plan never granted. Make it loud rather than returning 200 as if fine.
  if (result.count === 0) {
    console.error(
      "[subscription webhook] matched NO masjid — subscription",
      subscription.id,
      "customer",
      subscription.customer,
      "metadata.masjidId",
      masjidId ?? "(none)"
    );
    throw new Error(
      `No masjid matched subscription ${subscription.id}; refusing to ack`
    );
  }

  console.log(
    `[subscription webhook] ${masjidId ?? subscription.customer} -> ${
      isActive ? "PRO" : "FREE"
    } (${subscription.status})`
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const secret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET;
  if (!secret) {
    // 500 (not 400) so Stripe retries once this is configured, instead of
    // treating the event as permanently rejected and dropping it.
    console.error(
      "[subscription webhook] STRIPE_SUBSCRIPTION_WEBHOOK_SECRET is not set"
    );
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(body, sig, secret);
  } catch (e: any) {
    // Bad signature is permanent — 400 so Stripe stops retrying.
    console.error("[subscription webhook] signature verification failed:", e.message);
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
