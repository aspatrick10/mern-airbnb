import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  omit: {
    user: {
      hashedPassword: true,
    },
  },
}).$extends({
  result: {
    listing: {
      createdAt: {
        needs: { createdAt: true },
        compute(listing) {
          return listing.createdAt.toISOString();
        },
      },
    },
  },
});

export default prisma;
