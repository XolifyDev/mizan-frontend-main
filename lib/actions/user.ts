import { authClient } from "../auth-client"
import { prisma } from "../db";

export const getUser = async () => {
  const session = await authClient.getSession();
  if(!session || !session.data) return null; 
  const user = await prisma.user.findFirst({
    where: {
      id: session.data.user.id
    },
    include: {
      sessions: true
    }
  });

  return user;
}
