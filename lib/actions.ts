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

export async function registerUser({
  confirmPassword,
  email,
  name,
  password,
  termsAndConditions
}: {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
    termsAndConditions: boolean;
}) {
  try {
    const user = await auth.api.signUpEmail({
      body: {
        email,
        name,
        password,
      },
    });

    return user;
  } catch (error) {
    return error;
  }
}

export async function getProducts() {
  const products = await prisma.products.findMany();
  return products || [];
}
