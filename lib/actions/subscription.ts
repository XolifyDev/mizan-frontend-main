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

/** Starts Stripe Checkout for the Pro subscription. */
export async function startProCheckout(masjidId: string) {
  if (!PRICE_ID) {
    throw new Error("STRIPE_PRO_PRICE_ID is not configured");
  }

  const masjid = await assertOwner(masjidId);

  if (masjid.plan === "PRO") {
    redirect(`/dashboard/billing?masjidId=${masjidId}&status=already-pro`);
  }

  const customerId = await ensureBillingCustomer(masjid);

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
    allow_promotion_codes: true,
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
