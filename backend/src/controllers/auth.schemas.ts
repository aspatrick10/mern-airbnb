import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string(),
  email: z.string().email().min(3).max(255),
  password: z.string().min(7).max(255),
});

export const LoginSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(7).max(255),
});
