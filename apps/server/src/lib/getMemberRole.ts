import { eq, and } from "drizzle-orm";
import { db, projectMembers } from "@repo/db";

export const getMemberRole = async (projectId: string, userId: string) => {
  const [row] = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId),
      ),
    );
  return row?.role ?? null;
};
