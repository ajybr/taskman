import { Router, type Router as ExpressRouter } from "express";
import { eq } from "drizzle-orm";
import { db, users } from "@repo/db";
import { signupSchema, loginSchema } from "@repo/auth/schemas";
import { hashPassword, verifyPassword } from "@repo/auth/password";
import { signToken } from "@repo/auth/jwt";

const router: ExpressRouter = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error });
  }

  const { name, email, password } = parsed.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));

  if (existing) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning({ id: users.id, name: users.name, email: users.email });

  if (!user) {
    return res.status(500).json({ error: "User creation failed" });
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.cookie("token", token, COOKIE_OPTIONS);

  return res.status(201).json({ user, token });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error });
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.cookie("token", token, COOKIE_OPTIONS);

  return res.status(200).json({
    user: { id: user.id, name: user.name, email: user.email },
    token,
  });
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logged out" });
});

export default router;
