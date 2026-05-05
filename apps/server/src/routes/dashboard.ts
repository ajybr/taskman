import { Router } from "express";
import { eq, and, lt, isNull, isNotNull } from "drizzle-orm";
import { db, tasks, users, projectMembers } from "@repo/db";
import { requireAuth, AuthRequest } from "@repo/auth/middleware";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  const { projectId } = req.query;
  if (!projectId || typeof projectId !== "string") {
    return res.status(400).json({ error: "projectId query param required" });
  }

  const role = await getMemberRole(projectId, req.user!.userId);
  if (!role)
    return res.status(403).json({ error: "Not a member of this project" });

  const allTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId));

  const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'

  const byStatus = {
    todo: allTasks.filter((t) => t.status === "todo").length,
    in_progress: allTasks.filter((t) => t.status === "in_progress").length,
    done: allTasks.filter((t) => t.status === "done").length,
  };

  const overdue = allTasks.filter(
    (t) => t.dueDate && t.status !== "done" && t.dueDate < today,
  );

  const members = await db
    .select({ userId: users.id, name: users.name })
    .from(projectMembers)
    .innerJoin(users, eq(users.id, projectMembers.userId))
    .where(eq(projectMembers.projectId, projectId));

  const tasksByUser = members.map((member) => ({
    userId: member.userId,
    name: member.name,
    total: allTasks.filter((t) => t.assignedTo === member.userId).length,
    todo: allTasks.filter(
      (t) => t.assignedTo === member.userId && t.status === "todo",
    ).length,
    inProgress: allTasks.filter(
      (t) => t.assignedTo === member.userId && t.status === "in_progress",
    ).length,
    done: allTasks.filter(
      (t) => t.assignedTo === member.userId && t.status === "done",
    ).length,
  }));

  const unassigned = allTasks.filter((t) => !t.assignedTo).length;

  return res.json({
    total: allTasks.length,
    byStatus,
    overdue: overdue.length,
    overdueTasks: overdue,
    tasksByUser,
    unassigned,
  });
});

const getMemberRole = async (projectId: string, userId: string) => {
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

export default router;
