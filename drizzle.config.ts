import { defineConfig } from "drizzle-kit";
// import { env } from "./lib/env";

export default defineConfig({
  out: "./drizzle",
  schema: "./packages/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
