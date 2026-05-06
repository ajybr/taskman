import { create } from "zustand";
import type { Project, ProjectMember, ProjectRole } from "@repo/types";
import { api } from "@/lib/api";

interface ProjectStats {
  projectId: string;
  total: number;
  overdue: number;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  members: ProjectMember[];
  isLoading: boolean;
  projectStats: Map<string, ProjectStats>;
  fetchProjects: () => Promise<void>;
  setCurrentProject: (projectId: string | null) => Promise<void>;
  createProject: (name: string, description?: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
  fetchProjectStats: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  members: [],
  isLoading: false,
  projectStats: new Map(),

  fetchProjectStats: async () => {
    try {
      const stats = await api.projects.getStats();
      const statsMap = new Map<string, ProjectStats>();
      stats.forEach((s) => statsMap.set(s.projectId, s));
      set({ projectStats: statsMap });
    } catch (err) {
      console.error("Failed to fetch project stats:", err);
    }
  },

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const projects = await api.projects.list();
      set({ projects, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  setCurrentProject: async (projectId: string | null) => {
    if (!projectId) {
      set({ currentProject: null, members: [], isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const projectData = await api.projects.getWithMembers(projectId);
      const project: Project = {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description,
        createdAt: projectData.createdAt,
        role: projectData.callerRole as ProjectRole,
      };
      set({
        currentProject: project,
        members: projectData.members || [],
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  createProject: async (name: string, description?: string) => {
    const project = await api.projects.create({ name, description });
    set((state) => ({ projects: [...state.projects, project] }));
    return project;
  },

  deleteProject: async (id: string) => {
    await api.projects.delete(id);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }));
  },

  removeMember: async (projectId: string, userId: string) => {
    await api.projects.removeMember(projectId, userId);
    set((state) => ({
      members: state.members.filter((m) => m.userId !== userId),
    }));
  },
}));