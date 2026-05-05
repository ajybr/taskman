import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Task, TaskCreateInput, TaskUpdateInput } from "@repo/types";

export const TASKS_KEY = ["tasks"];

export function useTasks(projectId: string | null) {
  return useQuery({
    queryKey: [...TASKS_KEY, projectId],
    queryFn: () => (projectId ? api.tasks.list(projectId) : Promise.resolve([])),
    enabled: !!projectId,
  });
}

export function useRefreshTasks() {
  const queryClient = useQueryClient();
  return (projectId: string) => {
    queryClient.invalidateQueries({ queryKey: [...TASKS_KEY, projectId] });
  };
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, task }: { projectId: string; task: TaskCreateInput }) =>
      api.tasks.create(projectId, task),
    onMutate: async ({ projectId, task }) => {
      await queryClient.cancelQueries({ queryKey: [...TASKS_KEY, projectId] });
      const previousTasks = queryClient.getQueryData<Task[]>([...TASKS_KEY, projectId]);

      const tempId = `temp-${Date.now()}`;
      const optimisticTask: Task = {
        ...task,
        id: tempId,
        status: task.status || "todo",
        createdAt: new Date().toISOString(),
      } as Task;

      queryClient.setQueryData<Task[]>([...TASKS_KEY, projectId], (old = []) => [
        ...old,
        optimisticTask,
      ]);

      return { projectId, previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.projectId) {
        queryClient.setQueryData<Task[]>(
          [...TASKS_KEY, context.projectId],
          context.previousTasks
        );
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: [...TASKS_KEY, variables.projectId] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates, projectId }: { id: string; updates: TaskUpdateInput; projectId: string }) =>
      api.tasks.update(id, updates),
    onMutate: async ({ id, updates, projectId }) => {
      const key = [...TASKS_KEY, projectId];
      queryClient.cancelQueries({ queryKey: key });
      const previousTasks = queryClient.getQueryData<Task[]>(key);

      queryClient.setQueryData<Task[]>(key, (old = []) =>
        old.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );

      return { key, previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.key) {
        queryClient.setQueryData(context.key, context.previousTasks);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: [...TASKS_KEY, variables.projectId] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) => 
      api.tasks.delete(id),
    onMutate: async ({ id, projectId }) => {
      const key = [...TASKS_KEY, projectId];
      queryClient.cancelQueries({ queryKey: key });
      const previousTasks = queryClient.getQueryData<Task[]>(key);

      queryClient.setQueryData<Task[]>(key, (old = []) =>
        old.filter((t) => t.id !== id)
      );

      return { key, previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.key) {
        queryClient.setQueryData(context.key, context.previousTasks);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: [...TASKS_KEY, variables.projectId] });
    },
  });
}