"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
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
  void rememberMe;
  try {
    const user = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
    revalidatePath("/", "layout");
    revalidatePath("/dashboard", "layout");
    return {
      success: true as const,
      data: user,
    };
  } catch (err: unknown) {
    const authError = err as {
      statusCode?: number;
      status?: number;
      message?: string;
      error?: string;
    };
    return {
      success: false as const,
      statusCode: authError?.statusCode,
      status: authError?.status,
      message: authError?.message || "Unable to sign in.",
      error: authError?.error,
    };
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
  void confirmPassword;
  void termsAndConditions;
  try {
    const user = await auth.api.signUpEmail({
      body: { email, name, password },
      headers: await headers(),
    });

    return user;
  } catch (error) {
    return error;
  }
}

export async function getProducts() {
  const products = await prisma.product.findMany();
  return products || [];
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
  });
  return product || null;
}
