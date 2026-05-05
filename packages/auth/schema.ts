import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});

// Inferred types — import these in server routes
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
