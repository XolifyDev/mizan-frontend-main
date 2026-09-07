"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { stripeClient } from "@/lib/stripe";
import { getUser } from "@/lib/actions/user";
import { PRO_PRICE_CENTS } from "@/lib/plan";

// Read at call time, not module scope: a bundled module can be evaluated in a
// context where the variable isn't present, and caching the miss would make a
// later fix require a redeploy.
const priceId = () => process.env.STRIPE_PRO_PRICE_ID;
const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? process.env.DOMAIN ?? "http://localhost:3000";

/**
 * The line item for Pro.
 *
 * Defines the price inline via `price_data`, so no Product or Price has to be
 * created in the Stripe dashboard first — Stripe creates them from this. If
 * STRIPE_PRO_PRICE_ID is ever set it wins, so you can move to a managed Price
 * later without touching this code.
 */
const proLineItem = () => {
  const existing = priceId();
  if (existing) return { price: existing, quantity: 1 };

  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: PRO_PRICE_CENTS,
      recurring: { interval: "month" as const },
      product_data: {
        name: "Mizan Pro",
        description:
          "Unlimited displays, all prayer templates, split-screen layouts, donations & kiosk, analytics, and up to 10 team members.",
      },
    },
  };
};

/**
 * Whether checkout can run. Only the secret key is required now that the price
 * is defined inline.
 */
export async function isBillingConfigured(): Promise<boolean> {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Only the masjid owner may change billing. Returns the masjid or throws.
 */
async function assertOwner(masjidId: string) {
  const user = await getUser();
  if (!user) throw new Error("Not signed in");

  const masjid = await prisma.masjid.findUnique({
    where: { id: masjidId },
    select: {
      id: true,
      name: true,
      email: true,
      ownerId: true,
      billingCustomerId: true,
      plan: true,
    },
  });
  if (!masjid) throw new Error("Masjid not found");
  if (masjid.ownerId !== user.id && !(user as any).admin) {
    throw new Error("Only the masjid owner can manage billing");
  }
  return masjid;
}

/**
 * Ensures the masjid has its own Stripe customer.
 *
 * Deliberately separate from `Masjid.stripeAccountId` (Connect, money in) and
 * from `User.stripeCustomerId` (hardware orders). The subscription belongs to
 * the masjid, so ownership changes and multi-masjid users don't break billing.
 */
async function ensureBillingCustomer(masjid: {
  id: string;
  name: string;
  email: string;
  billingCustomerId: string | null;
}) {
  if (masjid.billingCustomerId) return masjid.billingCustomerId;

  const customer = await stripeClient.customers.create({
    name: masjid.name,
    email: masjid.email,
    metadata: { masjidId: masjid.id },
  });

  await prisma.masjid.update({
    where: { id: masjid.id },
    data: { billingCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * Validates a discount code without starting checkout, so the upgrade page can
 * show what it's worth before the masjid commits.
 */
export async function validatePromoCode(code: string) {
  const trimmed = code.trim();
  if (!trimmed) return { valid: false as const, message: "Enter a code" };

  try {
    const found = await stripeClient.promotionCodes.list({
      code: trimmed,
      active: true,
      limit: 1,
    });
    const promo = found.data[0];
    if (!promo) {
      return { valid: false as const, message: "That code isn't valid" };
    }

    const c = promo.coupon;
    const off = c.percent_off
      ? `${c.percent_off}% off`
      : c.amount_off
        ? `$${(c.amount_off / 100).toFixed(2)} off`
        : "Discount applied";
    const duration =
      c.duration === "forever"
        ? "for as long as you subscribe"
        : c.duration === "repeating" && c.duration_in_months
          ? `for ${c.duration_in_months} months`
          : "on your first payment";

    return { valid: true as const, message: `${off} ${duration}`, code: trimmed };
  } catch (e: any) {
    console.error("[promo] lookup failed", e);
    return { valid: false as const, message: "Couldn't check that code" };
  }
}

/** Starts Stripe Checkout for the Pro subscription. */
export async function startProCheckout(masjidId: string, promoCode?: string) {
  if (!process.env.STRIPE_SECRET_KEY) {
    // Misconfiguration is an operator problem, not the masjid's. Throwing here
    // bubbles out of the server action and takes the whole billing page down,
    // so send them back with something explainable instead.
    console.error("[billing] STRIPE_SECRET_KEY is not set — upgrade cannot start");
    redirect(`/dashboard/billing?masjidId=${masjidId}&status=billing-unavailable`);
  }

  const masjid = await assertOwner(masjidId);

  if (masjid.plan === "PRO") {
    redirect(`/dashboard/billing?masjidId=${masjidId}&status=already-pro`);
  }

  const customerId = await ensureBillingCustomer(masjid);

  // Resolve a typed-in code to a promotion code id. Stripe rejects
  // `discounts` and `allow_promotion_codes` together, so only one is sent:
  // a pre-applied discount when the masjid entered a valid code, otherwise
  // Stripe's own promo field on the checkout page.
  let discounts: { promotion_code: string }[] | undefined;
  const typed = promoCode?.trim();
  if (typed) {
    const found = await stripeClient.promotionCodes.list({
      code: typed,
      active: true,
      limit: 1,
    });
    if (found.data[0]) {
      discounts = [{ promotion_code: found.data[0].id }];
    }
    // An invalid code falls through to Stripe's own field rather than
    // blocking the upgrade.
  }

  const session = await stripeClient.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [proLineItem()],
    // Mirrored onto the subscription so the webhook can resolve the masjid even
    // if the customer record is ever reused or edited.
    subscription_data: { metadata: { masjidId } },
    metadata: { masjidId },
    success_url: `${appUrl()}/dashboard/billing?masjidId=${masjidId}&status=upgraded`,
    cancel_url: `${appUrl()}/dashboard/billing?masjidId=${masjidId}&status=cancelled`,
    ...(discounts ? { discounts } : { allow_promotion_codes: true }),
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  redirect(session.url);
}

/** Subscription statuses that should keep Pro unlocked. */
const ACTIVE_STATUSES = ["active", "trialing", "past_due"];

/**
 * Reconciles the masjid's plan against Stripe, which is the source of truth.
 *
 * Webhooks can be missed — misconfigured secret, a deploy mid-delivery, an
 * outage — and a missed one means a masjid pays and never receives Pro. This
 * closes that gap by checking Stripe directly when billing is viewed, so the
 * webhook becomes an optimisation rather than the only path to entitlement.
 *
 * Safe to call on every render: it only writes when Stripe and the database
 * actually disagree.
 */
export async function reconcileSubscription(masjidId: string): Promise<void> {
  if (!process.env.STRIPE_SECRET_KEY) return;

  try {
    const masjid = await prisma.masjid.findUnique({
      where: { id: masjidId },
      select: {
        id: true,
        plan: true,
        planStatus: true,
        billingCustomerId: true,
        stripeSubscriptionId: true,
      },
    });
    if (!masjid?.billingCustomerId) return;

    const subs = await stripeClient.subscriptions.list({
      customer: masjid.billingCustomerId,
      status: "all",
      limit: 10,
    });

    const active = subs.data.find((s) => ACTIVE_STATUSES.includes(s.status));
    const shouldBePro = Boolean(active);
    const status = active?.status ?? subs.data[0]?.status ?? null;

    // Period end lives on the subscription in older API versions and on its
    // items in newer ones.
    const periodEnd =
      (active as any)?.current_period_end ??
      (active?.items?.data ?? [])
        .map((i: any) => i.current_period_end)
        .find((v: any) => typeof v === "number");

    const currentlyPro = masjid.plan === "PRO";
    if (currentlyPro === shouldBePro && masjid.planStatus === status) return;

    await prisma.masjid.update({
      where: { id: masjidId },
      data: {
        plan: shouldBePro ? "PRO" : "FREE",
        planStatus: status,
        stripeSubscriptionId: active?.id ?? masjid.stripeSubscriptionId,
        planCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      },
    });

    console.log(
      `[billing] reconciled ${masjidId}: ${masjid.plan} -> ${
        shouldBePro ? "PRO" : "FREE"
      } (${status})`
    );
  } catch (e) {
    // Never let reconciliation break the billing page.
    console.error("[billing] reconcile failed", e);
  }
}

/** Opens the Stripe billing portal so the masjid can cancel or update payment. */
export async function openBillingPortal(masjidId: string) {
  const masjid = await assertOwner(masjidId);
  if (!masjid.billingCustomerId) {
    redirect(`/dashboard/billing?masjidId=${masjidId}&status=no-subscription`);
  }

  const session = await stripeClient.billingPortal.sessions.create({
    customer: masjid.billingCustomerId,
    return_url: `${appUrl()}/dashboard/billing?masjidId=${masjidId}`,
  });

  redirect(session.url);
}
