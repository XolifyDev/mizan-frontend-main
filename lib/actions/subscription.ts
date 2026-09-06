"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { stripeClient } from "@/lib/stripe";
import { getUser } from "@/lib/actions/user";

const PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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
  if (!PRICE_ID) {
    throw new Error("STRIPE_PRO_PRICE_ID is not configured");
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
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    // Mirrored onto the subscription so the webhook can resolve the masjid even
    // if the customer record is ever reused or edited.
    subscription_data: { metadata: { masjidId } },
    metadata: { masjidId },
    success_url: `${APP_URL}/dashboard/billing?masjidId=${masjidId}&status=upgraded`,
    cancel_url: `${APP_URL}/dashboard/billing?masjidId=${masjidId}&status=cancelled`,
    ...(discounts ? { discounts } : { allow_promotion_codes: true }),
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  redirect(session.url);
}

/** Opens the Stripe billing portal so the masjid can cancel or update payment. */
export async function openBillingPortal(masjidId: string) {
  const masjid = await assertOwner(masjidId);
  if (!masjid.billingCustomerId) {
    redirect(`/dashboard/billing?masjidId=${masjidId}&status=no-subscription`);
  }

  const session = await stripeClient.billingPortal.sessions.create({
    customer: masjid.billingCustomerId,
    return_url: `${APP_URL}/dashboard/billing?masjidId=${masjidId}`,
  });

  redirect(session.url);
}
