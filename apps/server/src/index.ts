import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { env } from "../../../lib/env.ts";
import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import taskRoutes from "./routes/tasks";
import dashboardRoutes from "./routes/dashboard";
import inviteRoutes from "./routes/invites";

const app = express();

app.use(cors({ origin: env.WEB_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", inviteRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
