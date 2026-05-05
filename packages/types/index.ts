export type User = {
  id: string;
  name: string;
  email: string;
};

export type ProjectRole = "admin" | "member";

export type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  role: ProjectRole;
};

export type ProjectMember = {
  userId: string;
  name: string;
  email: string;
  role: ProjectRole;
};

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string | null;
  createdBy: string;
  dueDate: string | null;
  createdAt: string;
};

export type DashboardStats = {
  byStatus: {
    todo: number;
    in_progress: number;
    done: number;
  };
  overdue: Task[];
  members: { userId: string; name: string }[];
};

export type InviteDetails = {
  projectId: string;
  projectName: string;
  description: string | null;
  invitedBy: string;
  role: ProjectRole;
  expiresAt: string;
};

export type InviteAcceptResult = {
  message: string;
  projectId: string;
  role: ProjectRole;
};

export type TaskCreateInput = Partial<Omit<Task, "id" | "createdAt" | "createdBy" | "projectId">>;
export type TaskUpdateInput = Partial<Omit<Task, "id" | "projectId" | "createdBy" | "createdAt">>;

export type ProjectCreateInput = {
  name: string;
  description?: string;
};

export type InviteCreateInput = {
  role?: ProjectRole;
  expiresIn?: "1d" | "7d" | "30d";
};