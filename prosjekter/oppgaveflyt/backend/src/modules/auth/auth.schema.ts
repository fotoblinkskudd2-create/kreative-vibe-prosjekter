import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10, "Passord må være minst 10 tegn"),
  name: z.string().trim().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
