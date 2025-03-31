import { z } from "zod";

// MongoDB ObjectId is a 24-character hexadecimal string
export const ObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");
