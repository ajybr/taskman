import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, tasks, projectMembers } from "@repo/db";
import { requireAuth, AuthRequest } from "@repo/auth/middleware";
import { z } from "zod";

const router = Router();
router.use(requireAuth);

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

const taskSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).trim().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().date().optional(), // 'YYYY-MM-DD'
  assignedTo: z.string().uuid().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/tasks?projectId=xxx — list tasks for a project
router.get("/", async (req: AuthRequest, res) => {
  const { projectId } = req.query;
  if (!projectId || typeof projectId !== "string") {
    return res.status(400).json({ error: "projectId query param required" });
  }

  const role = await getMemberRole(projectId, req.user!.userId);
  if (!role)
    return res.status(403).json({ error: "Not a member of this project" });

  // Admin gets all tasks, member gets only their tasks - filter at DB level
  let rows;
  if (role === "admin") {
    rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId));
  } else {
    // Member: query only tasks assigned to them
    rows = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.projectId, projectId),
          eq(tasks.assignedTo, req.user!.userId)
        )
      );
  }

  // Disable HTTP caching to prevent 304 Not Modified responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('ETag', '');

  return res.json(rows);
});

// POST /api/tasks — admin creates a task
router.post("/", async (req: AuthRequest, res) => {
  const { projectId, ...rest } = req.body;

  if (!projectId)
    return res.status(400).json({ error: "projectId is required" });

  const role = await getMemberRole(projectId, req.user!.userId);
  if (role !== "admin") return res.status(403).json({ error: "Admin only" });

  const parsed = taskSchema.safeParse(rest);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  // Validate assignee is actually a member of the project
  if (parsed.data.assignedTo) {
    const assigneeRole = await getMemberRole(projectId, parsed.data.assignedTo);
    if (!assigneeRole) {
      return res
        .status(400)
        .json({ error: "Assignee is not a member of this project" });
    }
  }

  const [task] = await db
    .insert(tasks)
    .values({
      ...parsed.data,
      projectId,
      createdBy: req.user!.userId,
    })
    .returning();

  return res.status(201).json(task);
});

// PATCH /api/tasks/:id — update task (split by role)
router.patch("/:id", async (req: AuthRequest, res) => {
  const [task] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, req.params.id));

  if (!task) return res.status(404).json({ error: "Task not found" });

  const role = await getMemberRole(task.projectId, req.user!.userId);
  if (!role)
    return res.status(403).json({ error: "Not a member of this project" });

  // Members can only update status — and only on their own tasks
  if (role === "member") {
    if (task.assignedTo !== req.user!.userId) {
      return res
        .status(403)
        .json({ error: "You can only update tasks assigned to you" });
    }

    const schema = z.object({
      status: z.enum(["todo", "in_progress", "done"]),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: parsed.error.flatten() });

    const [updated] = await db
      .update(tasks)
      .set(parsed.data)
      .where(eq(tasks.id, task.id))
      .returning();

    return res.json(updated);
  }

  // Admin can update anything
  const parsed = taskSchema.partial().safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  if (parsed.data.assignedTo) {
    const assigneeRole = await getMemberRole(
      task.projectId,
      parsed.data.assignedTo,
    );
    if (!assigneeRole) {
      return res
        .status(400)
        .json({ error: "Assignee is not a member of this project" });
    }
  }

  const [updated] = await db
    .update(tasks)
    .set(parsed.data)
    .where(eq(tasks.id, task.id))
    .returning();

  return res.json(updated);
});

// DELETE /api/tasks/:id — admin only
router.delete("/:id", async (req: AuthRequest, res) => {
  const [task] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, req.params.id));

  if (!task) return res.status(404).json({ error: "Task not found" });

  const role = await getMemberRole(task.projectId, req.user!.userId);
  if (role !== "admin") return res.status(403).json({ error: "Admin only" });

  await db.delete(tasks).where(eq(tasks.id, task.id));

  return res.status(200).json({ message: "Task deleted" });
});

export default router;
