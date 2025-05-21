"use server";

import { prisma } from "../db";
import { stripeClient } from "../stripe";

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
  const stripeSession = await stripeClient.checkout.sessions.retrieve(checkoutSession?.sessionId);

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

  console.log(order, checkoutSession, sessionId);

  const stripeSession = await stripeClient.paymentIntents.retrieve(checkoutSession?.sessionId as string);

  return {
    order,
    checkoutSession,
    stripeSession: stripeSession ? {
      amount_total: stripeSession.amount,
      created: stripeSession.created
    } : null
  };
}

// Get all orders (admin)
export const getAllOrders = async () => {
  return prisma.orders.findMany({
    include: {
      user: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

// Get a single order by ID
export const getOrderById = async (id: string) => {
  return prisma.orders.findUnique({
    where: { id },
    include: {
      user: true
    }
  });
};

// Update an order (status, tracking number, etc.)
export const updateOrder = async (id: string, data: { status?: string; trackingNumber?: string }) => {
  return prisma.orders.update({
    where: { id },
    data
  });
};
