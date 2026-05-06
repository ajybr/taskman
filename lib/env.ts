import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  WEB_URL: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error);
  throw new Error("Invalid environment variables - ensure DATABASE_URL, JWT_SECRET, and WEB_URL are set");
}

export const env = parsed.data;