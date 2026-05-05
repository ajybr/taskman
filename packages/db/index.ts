import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on("error", (err) => console.error("[DB] Pool error:", err));

export const db = drizzle({ client: pool });
export const { users, projects, projectMembers, tasks, projectInvites } =
  schema;
export { schema };
