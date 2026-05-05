import { Router } from "express";
import { eq, and, gt, isNull } from "drizzle-orm";
import { db, projectInvites, projectMembers, projects, users } from "@repo/db";
import { requireAuth, AuthRequest } from "@repo/auth/middleware";
import { getMemberRole } from "../lib/getMemberRole";
import { z } from "zod";

const router = Router();

// ── POST /api/projects/:id/invites ────────────────────────────────────────────
// Admin generates a shareable invite link
router.post(
  "/projects/:id/invites",
  requireAuth,
  async (req: AuthRequest, res) => {
    const { id: projectId } = req.params;

    const role = await getMemberRole(projectId, req.user!.userId);
    if (role !== "admin") return res.status(403).json({ error: "Admin only" });

    const schema = z.object({
      role: z.enum(["admin", "member"]).default("member"),
      expiresIn: z.enum(["1d", "7d", "30d"]).default("7d"), // how long the link is valid
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: parsed.error.flatten() });

    const expiryMs: Record<string, number> = {
      "1d": 1 * 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };

    const inviteToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + expiryMs[parsed.data.expiresIn]);

    const [invite] = await db
      .insert(projectInvites)
      .values({
        projectId,
        inviteToken,
        invitedBy: req.user!.userId,
        role: parsed.data.role,
        expiresAt,
      })
      .returning();

    const inviteUrl = `${process.env.WEB_URL}/invite/${inviteToken}`;

    return res.status(201).json({
      id: invite.id,
      inviteUrl,
      role: invite.role,
      expiresAt: invite.expiresAt,
    });
  },
);

// ── GET /api/invites/:token ───────────────────────────────────────────────────
// Public — validate token and return project preview (no auth required)
router.get("/invites/:token", async (req, res) => {
  const { token } = req.params;

  const [invite] = await db
    .select()
    .from(projectInvites)
    .where(eq(projectInvites.inviteToken, token));

  if (!invite) {
    return res.status(404).json({ error: "Invite link is invalid" });
  }

  if (invite.acceptedAt) {
    return res
      .status(410)
      .json({ error: "This invite link has already been used" });
  }

  if (new Date() > invite.expiresAt) {
    return res.status(410).json({ error: "This invite link has expired" });
  }

  // Return enough for the frontend to render a preview page
  const [project] = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
    })
    .from(projects)
    .where(eq(projects.id, invite.projectId));

  const [inviter] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, invite.invitedBy));

  return res.json({
    projectId: project.id,
    projectName: project.name,
    description: project.description,
    invitedBy: inviter.name,
    role: invite.role,
    expiresAt: invite.expiresAt,
  });
});
//
// ── POST /api/invites/:token/accept ───────────────────────────────────────────
// Logged-in user accepts invite and joins the project
router.post(
  "/invites/:token/accept",
  requireAuth,
  async (req: AuthRequest, res) => {
    const { token } = req.params;
    const userId = req.user!.userId;

    const [invite] = await db
      .select()
      .from(projectInvites)
      .where(eq(projectInvites.inviteToken, token));

    // Validate token state
    if (!invite) {
      return res.status(404).json({ error: "Invite link is invalid" });
    }
    if (invite.acceptedAt) {
      return res
        .status(410)
        .json({ error: "This invite link has already been used" });
    }
    if (new Date() > invite.expiresAt) {
      return res.status(410).json({ error: "This invite link has expired" });
    }

    // Graceful: already a member → don't error, just return the project id
    const existingRole = await getMemberRole(invite.projectId, userId);
    if (existingRole) {
      return res.status(200).json({
        message: "You are already a member of this project",
        projectId: invite.projectId,
      });
    }

    // Add to project and mark token consumed — both in one transaction
    await db.transaction(async (tx) => {
      await tx.insert(projectMembers).values({
        projectId: invite.projectId,
        userId,
        role: invite.role,
      });

      await tx
        .update(projectInvites)
        .set({ acceptedAt: new Date() })
        .where(eq(projectInvites.id, invite.id));
    });

    return res.status(201).json({
      message: "Successfully joined the project",
      projectId: invite.projectId,
      role: invite.role,
    });
  },
);

// ── GET /api/projects/:id/invites ─────────────────────────────────────────────
// Admin lists all active (unused, unexpired) invites for a project
router.get(
  "/projects/:id/invites",
  requireAuth,
  async (req: AuthRequest, res) => {
    const { id: projectId } = req.params;

    const role = await getMemberRole(projectId, req.user!.userId);
    if (role !== "admin") return res.status(403).json({ error: "Admin only" });

    const now = new Date();

    const activeInvites = await db
      .select({
        id: projectInvites.id,
        role: projectInvites.role,
        expiresAt: projectInvites.expiresAt,
        createdBy: users.name,
      })
      .from(projectInvites)
      .innerJoin(users, eq(users.id, projectInvites.invitedBy))
      .where(
        and(
          eq(projectInvites.projectId, projectId),
          isNull(projectInvites.acceptedAt), // not yet used
          gt(projectInvites.expiresAt, now), // not expired
        ),
      );

    // Reconstruct the URL for each invite
    const result = activeInvites.map((inv) => ({
      ...inv,
      inviteUrl: `${process.env.WEB_URL}/invite/${inv.id}`, // id used as lookup here
    }));

    return res.json(result);
  },
);

// ── DELETE /api/projects/:id/invites/:inviteId ────────────────────────────────
// Admin revokes an invite before it expires
// router.delete(
//   "/projects/:id/invites/:inviteId",
//   requireAuth,
//   async (req: AuthRequest, res) => {
//     const { id: projectId, inviteId } = req.params;
//
//     const role = await getMemberRole(projectId, req.user!.userId);
//     if (role !== "admin") return res.status(403).json({ error: "Admin only" });
//
//     const [invite] = await db
//       .select()
//       .from(projectInvites)
//       .where(
//         and(
//           eq(projectInvites.id, inviteId),
//           eq(projectInvites.projectId, projectId), // scope to project — prevent cross-project deletion
//         ),
//       );
//
//     if (!invite) return res.status(404).json({ error: "Invite not found" });
//
//     await db.delete(projectInvites).where(eq(projectInvites.id, inviteId));
//
//     return res.status(200).json({ message: "Invite revoked" });
//   },
// );
//
export default router;
