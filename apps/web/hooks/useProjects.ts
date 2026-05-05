import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useProjectStore } from "@/stores/projectStore";

export const PROJECTS_KEY = ["projects"];

export function useProjects() {
  const { projects, fetchProjects, isLoading } = useProjectStore();

  const query = useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: fetchProjects,
    enabled: false,
  });

  return {
    projects: query.data || projects,
    isLoading: query.isLoading || isLoading,
    refetch: query.refetch,
    fetchProjects,
  };
}

export function useProject(projectId: string | null) {
  const { currentProject, members, setCurrentProject, isLoading } = useProjectStore();

  const query = useQuery({
    queryKey: [...PROJECTS_KEY, projectId],
    queryFn: async () => {
      if (projectId) {
        await setCurrentProject(projectId);
      }
    },
    enabled: !!projectId,
  });

  return {
    project: currentProject,
    members,
    isLoading: query.isLoading || isLoading,
    refetch: query.refetch,
  };
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const createProject = useProjectStore((s) => s.createProject);

  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      createProject(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const deleteProject = useProjectStore((s) => s.deleteProject);

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  const removeMember = useProjectStore((s) => s.removeMember);

  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}