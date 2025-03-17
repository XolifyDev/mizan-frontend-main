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
  try {
    const user = await auth.api.signInEmail({
      body: {
        email,
        password
      },
    });
    return user;
  } catch (err) {
    return err;
  }
}
