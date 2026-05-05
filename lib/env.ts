import { z } from "zod";

console.log("DEBUG: Available env keys:", Object.keys(process.env));
console.log("DEBUG: DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
console.log("DEBUG: JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "NOT SET");
console.log("DEBUG: WEB_URL:", process.env.WEB_URL ? "SET" : "NOT SET");

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  WEB_URL: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error);
  throw new Error("Invalid environment variables - check .env file");
}

export const env = parsed.data;