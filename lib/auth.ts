import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { prisma } from "./db";
import { nextCookies } from "better-auth/next-js";
import { stripe } from "@better-auth/stripe"
import Stripe from "stripe"

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {  
        enabled: true
    },
    plugins: [
      nextCookies(),
      // stripe({
      //       stripeClient,
      //       stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      //       createCustomerOnSignUp: true,
      // })
    ]
});
