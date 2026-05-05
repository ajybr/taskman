import { axiosClient } from "./axios";
import type {
  User,
  Project,
  ProjectMember,
  Task,
  DashboardStats,
  TaskCreateInput,
  TaskUpdateInput,
  ProjectCreateInput,
  InviteDetails,
  InviteAcceptResult,
  ProjectRole,
} from "@repo/types";

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const { data } = await axiosClient.post<{ user: User; token: string }>("/auth/login", {
        email,
        password,
      });
      return data;
    },

    signup: async (name: string, email: string, password: string) => {
      const { data } = await axiosClient.post<{ user: User; token: string }>("/auth/signup", {
        name,
        email,
        password,
      });
      return data;
    },

    logout: async () => {
      const { data } = await axiosClient.post<{ message: string }>("/auth/logout");
      return data;
    },
  },

  projects: {
    list: async () => {
      const { data } = await axiosClient.get<Project[]>("/projects");
      return data;
    },

    get: async (id: string) => {
      const { data } = await axiosClient.get<Project>(`/projects/${id}`);
      return data;
    },

    getWithMembers: async (id: string) => {
      const { data } = await axiosClient.get<Project & { members: ProjectMember[]; callerRole: ProjectRole }>(
        `/projects/${id}`
      );
      return data;
    },

    create: async (input: ProjectCreateInput) => {
      const { data } = await axiosClient.post<Project>("/projects", input);
      return data;
    },

    delete: async (id: string) => {
      const { data } = await axiosClient.delete<{ message: string }>(`/projects/${id}`);
      return data;
    },

    removeMember: async (projectId: string, userId: string) => {
      const { data } = await axiosClient.delete<{ message: string }>(
        `/projects/${projectId}/members/${userId}`
      );
      return data;
    },
  },

  tasks: {
    list: async (projectId: string) => {
      const { data } = await axiosClient.get<Task[]>(`/tasks?projectId=${projectId}`);
      return data;
    },

    create: async (projectId: string, task: TaskCreateInput) => {
      const { data } = await axiosClient.post<Task>("/tasks", { projectId, ...task });
      return data;
    },

    update: async (id: string, updates: TaskUpdateInput) => {
      const { data } = await axiosClient.patch<Task>(`/tasks/${id}`, updates);
      return data;
    },

    delete: async (id: string) => {
      const { data } = await axiosClient.delete<{ message: string }>(`/tasks/${id}`);
      return data;
    },
  },

  dashboard: {
    getStats: async (projectId: string) => {
      const { data } = await axiosClient.get<DashboardStats>(`/dashboard?projectId=${projectId}`);
      return data;
    },
  },

  invites: {
    create: async (
      projectId: string,
      role: ProjectRole = "member",
      expiresIn: "1d" | "7d" | "30d" = "7d"
    ) => {
      const { data } = await axiosClient.post<{
        id: string;
        inviteUrl: string;
        role: string;
        expiresAt: string;
      }>(`/projects/${projectId}/invites`, { role, expiresIn });
      return data;
    },

    delete: async (projectId: string, inviteId: string) => {
      const { data } = await axiosClient.delete<{ message: string }>(
        `/projects/${projectId}/invites/${inviteId}`
      );
      return data;
    },

    validate: async (token: string) => {
      const { data } = await axiosClient.get<InviteDetails>(`/invites/${token}`);
      return data;
    },

    accept: async (token: string) => {
      const { data } = await axiosClient.post<InviteAcceptResult>(`/invites/${token}/accept`);
      return data;
    },
  },
};