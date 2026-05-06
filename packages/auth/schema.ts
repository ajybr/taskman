import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50).trim(),
  email: z.string().min(1, "Email is required").email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

// Client-side signup schema with confirmPassword
export const clientSignupSchema = signupSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Inferred types — import these in server routes
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ClientSignupInput = z.infer<typeof clientSignupSchema>;
