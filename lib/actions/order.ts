"use server";

import { prisma } from "../db";
import { stripeClient } from "../stripe";
import { getUserMasjid } from "./masjid";

async function requireMasjidAccess(masjidId: string | null) {
  if (!masjidId) return null;
  const masjid = await getUserMasjid(masjidId);
  if (!masjid || (typeof masjid === "object" && "error" in masjid)) {
    return null;
  }
  return masjid;
}

export const getSessionAndOrder = async (sessionId: string) => {
  const checkoutSession = await prisma.checkoutSessions.findFirst({
    where: {
      sessionId
    },
    include: {
      user: true
    }
  });
  const order = await prisma.orders.findFirst({
    where: {
      stripeSessionId: sessionId
    }
  });
  if (!checkoutSession) {
    return {
      order: null,
      checkoutSession: null,
      stripeSession: null
    };
  }
  const stripeSession = await stripeClient.checkout.sessions.retrieve(checkoutSession?.sessionId as string);

  return {
    order,
    checkoutSession,
    stripeSession: stripeSession ? {
      amount_total: stripeSession.amount_total,
      created: stripeSession.created
    } : null
  };
}

export const getPaymentAndOrder = async (sessionId: string) => {
  const checkoutSession = await prisma.checkoutSessions.findFirst({
    where: {
      sessionId
    },
    include: {
      user: true
    }
  });
  
  const order = await prisma.orders.findFirst({
    where: {
      stripeSessionId: sessionId
    }
  });

  const stripeSession = await stripeClient.paymentIntents.retrieve(checkoutSession?.sessionId as string);

  return {
    order,
    checkoutSession,
    stripeSession: stripeSession ? {
      amount_total: stripeSession.amount,
      created: stripeSession.created,
    } : null
  };
}

// Get all orders (admin)
export const getAllOrders = async () => {
  const o = await prisma.orders.findMany({
    include: {
      user: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  return o;
};

export async function getOrderById(id: string) {
  try {
    console.log('Fetching order with ID 123:', id);
    const order = await prisma.orders.findFirst({
      where: {
        id: id
      }, 
      include: {
        masjid: true,
        user: true,
      },
    });
    
    console.log('Order found:', order ? 'yes' : 'no');
    if (!order) return null;
    const access = await requireMasjidAccess(order.masjidId);
    if (!access) {
      throw new Error("Unauthorized");
    }
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

// Update an order (status, tracking number, etc.)
export const updateOrder = async (id: string, data: { status?: string; trackingNumber?: string }) => {
  const existing = await prisma.orders.findUnique({
    where: { id },
  });
  if (!existing) {
    throw new Error("Order not found");
  }
  const access = await requireMasjidAccess(existing.masjidId);
  if (!access) {
    throw new Error("Unauthorized");
  }
  const o = await prisma.orders.update({
    where: { id },
    data
  });
  return o;
};
