import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, projects, projectMembers, users, tasks } from "@repo/db";
import { requireAuth, AuthRequest } from "@repo/auth/middleware";
import { z } from "zod";

const router = Router();
router.use(requireAuth); // all project routes require login

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Returns the caller's role in a project, or null if not a member
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

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/projects — list all projects the caller belongs to
router.get("/", async (req: AuthRequest, res) => {
  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      createdAt: projects.createdAt,
      role: projectMembers.role,
    })
    .from(projectMembers)
    .innerJoin(projects, eq(projects.id, projectMembers.projectId))
    .where(eq(projectMembers.userId, req.user!.userId));

  return res.json(rows);
});

// POST /api/projects — create project, auto-add creator as admin
router.post("/", async (req: AuthRequest, res) => {
  const schema = z.object({
    name: z.string().min(1).max(100).trim(),
    description: z.string().max(500).trim().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const { name, description } = parsed.data;
  const userId = req.user!.userId;

  const [project] = await db
    .insert(projects)
    .values({ name, description, createdBy: userId })
    .returning();

  // Creator is automatically the admin
  await db.insert(projectMembers).values({
    projectId: project.id,
    userId,
    role: "admin",
  });

  return res.status(201).json(project);
});

// GET /api/projects/:id — get single project + members list
router.get("/:id", async (req: AuthRequest, res) => {
  const { id } = req.params;
  const role = await getMemberRole(id, req.user!.userId);
  if (!role)
    return res.status(403).json({ error: "Not a member of this project" });

  const [project] = await db.select().from(projects).where(eq(projects.id, id));

  if (!project) return res.status(404).json({ error: "Project not found" });

  const members = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      role: projectMembers.role,
    })
    .from(projectMembers)
    .innerJoin(users, eq(users.id, projectMembers.userId))
    .where(eq(projectMembers.projectId, id));

  return res.json({ ...project, members, callerRole: role });
});

// POST /api/projects/:id/members — admin adds a member by email
router.post("/:id/members", async (req: AuthRequest, res) => {
  const { id } = req.params;
  const role = await getMemberRole(id, req.user!.userId);
  if (role !== "admin") return res.status(403).json({ error: "Admin only" });

  const schema = z.object({
    email: z.string().email().toLowerCase().trim(),
    role: z.enum(["admin", "member"]).default("member"),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email));

  if (!targetUser)
    return res.status(404).json({ error: "No user with that email" });

  // Prevent duplicate membership
  const existing = await getMemberRole(id, targetUser.id);
  if (existing)
    return res.status(409).json({ error: "User is already a member" });

  await db.insert(projectMembers).values({
    projectId: id,
    userId: targetUser.id,
    role: parsed.data.role,
  });

  return res.status(201).json({ message: "Member added" });
});

// DELETE /api/projects/:id/members/:userId — admin removes a member
router.delete("/:id/members/:userId", async (req: AuthRequest, res) => {
  const { id, userId } = req.params;
  const callerRole = await getMemberRole(id, req.user!.userId);
  if (callerRole !== "admin")
    return res.status(403).json({ error: "Admin only" });

  // Prevent admin from removing themselves if they're the sole admin
  if (userId === req.user!.userId) {
    const admins = await db
      .select()
      .from(projectMembers)
      .where(
        and(eq(projectMembers.projectId, id), eq(projectMembers.role, "admin")),
      );

    if (admins.length === 1) {
      return res.status(400).json({ error: "Cannot remove the only admin" });
    }
  }

  await db
    .delete(projectMembers)
    .where(
      and(eq(projectMembers.projectId, id), eq(projectMembers.userId, userId)),
    );

  return res.status(200).json({ message: "Member removed" });
});

// GET /api/projects/stats — get task stats for all projects
router.get("/stats", async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const today = new Date().toISOString().split("T")[0];

  // Get all projects user is member of
  const userProjects = await db
    .select({ projectId: projectMembers.projectId })
    .from(projectMembers)
    .where(eq(projectMembers.userId, userId));

  const projectIds = userProjects.map((p) => p.projectId);

  if (projectIds.length === 0) {
    return res.json({ projects: [] });
  }

  // Get stats for each project individually
  const stats = await Promise.all(
    projectIds.map(async (projectId) => {
      const projectTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, projectId));

      const total = projectTasks.length;
      const overdue = projectTasks.filter(
        (t) => t.dueDate && t.status !== "done" && t.dueDate < today,
      ).length;

      return { projectId, total, overdue };
    })
  );

  return res.json({ projects: stats });
});

export default router;
