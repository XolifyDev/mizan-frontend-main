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
