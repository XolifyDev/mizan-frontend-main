import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
    baseURL: process.env.DOMAIN // the base url of your auth server
});
