import { prisma } from "./prisma";

const DEFAULT_USER_ID = "default-user";

export async function getUser() {
  let user = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
    include: { profile: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: DEFAULT_USER_ID,
        email: "me@vitalis.local",
        name: "User",
        profile: {
          create: {},
        },
      },
      include: { profile: true },
    });
  }

  return user;
}

export function getUserId() {
  return DEFAULT_USER_ID;
}
