"use server";
import { auth } from "../auth";
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
      sessions: true,
      masjids: true,
    }
  });
  return user;
}

// export const resetPassword = async (email: string) => {
//   const user = await auth.api.
//   return user;
// }

export const getUsersByMasjid = async (masjidId: string, userId: string) => {
  const users = await prisma.user.findMany({
    where: {
      masjids: {
        some: {
          id: masjidId
        }
      },
      id: {
        not: userId
      }
    },
    include: {
      masjids: true,
      masjidInvites: true,
    }
  });
  return users;
}

export const filterSearchUsers = async (value: string, masjidId: string, session: any) => {
  const results = await prisma.user.findMany({
    where: {
      email: {
        contains: value.toLowerCase(),
      },
      NOT: {
        id: session?.user.id,
      },
      masjids: {
        none: {
          id: masjidId
        }
      }
    },
    select: {
      id: true,
      name: true, 
      email: true,
      image: true
    },
    take: 5
  });
  return results;
}