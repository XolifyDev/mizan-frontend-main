import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { nextCookies } from "better-auth/next-js";
import { customSession } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe"
import { stripeClient } from "./stripe";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {  
        enabled: true,
        // sendResetPassword: async ({user, url, token}, request) => {
        //     await sendEmail({
        //         to: user.email,
        //         subject: "Reset your password",
        //         text: `Click the link to reset your password: ${url}`,
        //     });
        // },
    },
    plugins: [
        stripe({
            stripeClient,
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
            createCustomerOnSignUp: true,
        }),
        nextCookies(),
        customSession(async ({ user, session }) => {
            const dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { masjids: true } });
            return {
                user: {
                    ...user,
                    admin: dbUser?.admin || false,
                    masjids: dbUser?.masjids || [],
                },
                session,
            };
        }),
    ],
});
