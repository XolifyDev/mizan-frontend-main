import { createAuthClient } from "better-auth/react"
import { stripeClient } from "@better-auth/stripe/client"

export const authClient = createAuthClient({
    baseURL: process.env.DOMAIN, // the base url of your auth server
    plugins: [
    stripeClient({
      subscription: true //if you want to enable subscription management
    })
  ]
});
