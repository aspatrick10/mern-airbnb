import { User } from "@prisma/client";

// add user to request
declare global {
  namespace Express {
    interface Request {
      user: Omit<User, "hashedPassword">;
    }
  }
}

export {};
