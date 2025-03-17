"use server";

import { auth } from "./auth";
import { prisma } from "./db";


export async function loginUser({
  email,
  password,
  rememberMe
}: {
    email: string,
    password: string,
    rememberMe: boolean
}) {
  const user = await auth.api.signInEmail({
    body: {
      email,
      password
    },
  });

  return user;
}
