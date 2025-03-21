import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  omit: {
    user: {
      hashedPassword: true,
    },
  },
});

export default prisma;
