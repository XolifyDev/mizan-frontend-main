"use server";
import { auth } from "../auth";
import { authClient } from "../auth-client"
import { prisma } from "../db";
import { headers } from "next/headers";

export const getUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if(!session || !session.session) return null; 
  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id
    },
    include: {
      sessions: true
    }
  });

  console.log(user);

  return user;
}
