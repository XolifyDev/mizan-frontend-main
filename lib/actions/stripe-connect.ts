"use server";

import { prisma } from "@/lib/db";
import { getUser } from "./user";
import { stripeClient } from "../stripe";
import { revalidatePath } from "next/cache";

async function getMasjidForUser(masjidId: string) {
  const user = await getUser();
  if (!user) return null;
  return prisma.masjid.findFirst({
    where: { id: masjidId, users: { some: { id: user.id } } },
  });
}

/** Create a Stripe Express account and return the onboarding URL */
export async function createStripeConnectAccount(masjidId: string, returnUrl: string) {
  const masjid = await getMasjidForUser(masjidId);
  if (!masjid) return { error: true, message: "Masjid not found" };

  try {
    let accountId = masjid.stripeAccountId;

    if (!accountId) {
      const account = await stripeClient.accounts.create({
        type: "express",
        email: masjid.email,
        business_profile: {
          name: masjid.name,
          url: masjid.websiteUrl || undefined,
        },
        metadata: { masjidId },
      });
      accountId = account.id;
      await prisma.masjid.update({
        where: { id: masjidId },
        data: { stripeAccountId: accountId, stripeAccountStatus: "onboarding" },
      });
    }

    const link = await stripeClient.accountLinks.create({
      account: accountId,
      refresh_url: `${returnUrl}?reconnect=1`,
      return_url: `${returnUrl}?connected=1`,
      type: "account_onboarding",
    });

    return { error: false, url: link.url };
  } catch (e: any) {
    return { error: true, message: e.message };
  }
}

/** Get a fresh dashboard link for an already-connected account */
export async function getStripeConnectDashboardLink(masjidId: string) {
  const masjid = await getMasjidForUser(masjidId);
  if (!masjid?.stripeAccountId) return { error: true, message: "No connected account" };

  try {
    const link = await stripeClient.accounts.createLoginLink(masjid.stripeAccountId);
    return { error: false, url: link.url };
  } catch (e: any) {
    return { error: true, message: e.message };
  }
}

/** Disconnect / deauthorize the Stripe account */
export async function disconnectStripeAccount(masjidId: string) {
  const masjid = await getMasjidForUser(masjidId);
  if (!masjid) return { error: true, message: "Masjid not found" };

  if (masjid.stripeAccountId) {
    try {
      await stripeClient.oauth?.deauthorize?.({
        client_id: process.env.STRIPE_CLIENT_ID!,
        stripe_user_id: masjid.stripeAccountId,
      });
    } catch {
      // OAuth deauth may fail if not OAuth-based — that's fine, we still clear locally
    }
  }

  await prisma.masjid.update({
    where: { id: masjidId },
    data: { stripeAccountId: null, stripeAccountStatus: null },
  });

  revalidatePath("/dashboard/settings");
  return { error: false };
}

/** Sync account status from Stripe */
export async function refreshStripeAccountStatus(masjidId: string) {
  const masjid = await getMasjidForUser(masjidId);
  if (!masjid?.stripeAccountId) return { error: true, message: "No connected account" };

  try {
    const account = await stripeClient.accounts.retrieve(masjid.stripeAccountId);
    const status =
      account.charges_enabled && account.payouts_enabled
        ? "active"
        : account.details_submitted
          ? "pending"
          : "onboarding";

    await prisma.masjid.update({
      where: { id: masjidId },
      data: { stripeAccountStatus: status },
    });

    revalidatePath("/dashboard/settings");
    return { error: false, status };
  } catch (e: any) {
    return { error: true, message: e.message };
  }
}

/** Save Stripe processing fee overrides */
export async function saveStripeFees(masjidId: string, flatFee: number, percentageFee: number) {
  const masjid = await getMasjidForUser(masjidId);
  if (!masjid) return { error: true, message: "Masjid not found" };

  await prisma.masjid.update({
    where: { id: masjidId },
    data: { stripeFlatFee: flatFee, stripePercentageFee: percentageFee },
  });

  revalidatePath("/dashboard/settings");
  return { error: false };
}
