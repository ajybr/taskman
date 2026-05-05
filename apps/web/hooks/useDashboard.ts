import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ProjectRole } from "@repo/types";

export const DASHBOARD_KEY = ["dashboard"];

export function useDashboardStats(projectId: string | null) {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, projectId],
    queryFn: () => (projectId ? api.dashboard.getStats(projectId) : Promise.resolve(null)),
    enabled: !!projectId,
  });
}

export function useInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      role,
      expiresIn,
    }: {
      projectId: string;
      role?: ProjectRole;
      expiresIn?: "1d" | "7d" | "30d";
    }) => api.invites.create(projectId, role, expiresIn),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
}

export function useValidateInvite(token: string) {
  return useQuery({
    queryKey: ["invite", token],
    queryFn: () => api.invites.validate(token),
    enabled: !!token,
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => api.invites.accept(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}