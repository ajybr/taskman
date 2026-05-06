"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCw, ListTodo, Target } from "lucide-react";
import { useAuthStore, useProjectStore, useToastStore } from "@/stores";
import { useEffect } from "react";
import {
  useTasks,
  useRefreshTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/hooks";
import { useDashboardStats, useInvite } from "@/hooks/useDashboard";
import {
  TaskCard,
  TaskForm,
  MembersList,
  InviteModal,
} from "@/components/dashboard";
import { Modal } from "@/components/common";
import type { TaskStatus, TaskPriority, ProjectRole } from "@repo/types";

const STATUS_COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: "todo", label: "To Do", color: "bg-info/10" },
  { key: "in_progress", label: "In Progress", color: "bg-warning/10" },
  { key: "done", label: "Done", color: "bg-success/10" },
];

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const { user, isAuthenticated } = useAuthStore();
  const { setCurrentProject } = useProjectStore();
  const { addToast } = useToastStore();

  const [showNewTask, setShowNewTask] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { data: tasks = [], isLoading: tasksLoading } = useTasks(projectId);
  const { data: stats } = useDashboardStats(projectId);
  const isProjectLoading = useProjectStore((s) => s.isLoading);
  const refreshTasks = useRefreshTasks();

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const invite = useInvite();

  const projects = useProjectStore((s) => s.projects);
  const currentProject = useProjectStore((s) => s.currentProject);
  const members = useProjectStore((s) => s.members);
  const projectStats = useProjectStore((s) => s.projectStats);
  const fetchProjectStats = useProjectStore((s) => s.fetchProjectStats);

  useEffect(() => {
    if (projects.length > 0) {
      fetchProjectStats();
    }
  }, [projects.length, fetchProjectStats]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, typeof tasks> = {
      todo: [],
      in_progress: [],
      done: [],
    };
    tasks.forEach((task) => {
      grouped[task.status].push(task);
    });
    return grouped;
  }, [tasks]);

  const getUserTaskCount = (projectId: string) => {
    return tasks.filter((t) => t.assignedTo === user?.id).length;
  };

  const handleSelectProject = async (projectId: string) => {
    await setCurrentProject(projectId);
  };

  const handleRemoveMember = async (userId: string) => {
    if (!currentProject) return;
    try {
      await useProjectStore.getState().removeMember(currentProject.id, userId);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description?: string;
    priority: TaskPriority;
    assignedTo: string | null;
    dueDate?: string;
  }) => {
    if (!projectId) return;
    try {
      await createTask.mutateAsync({
        projectId,
        task: {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          status: "todo",
          assignedTo: taskData.assignedTo,
          dueDate: taskData.dueDate || null,
        },
      });
      addToast("Task created", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to create task");
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    if (!projectId) return;
    try {
      await updateTask.mutateAsync({
        id: taskId,
        updates: { status },
        projectId,
      });
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!projectId) return;
    try {
      await deleteTask.mutateAsync({ id: taskId, projectId });
      addToast("Task deleted", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const handleInvite = async (
    role: "admin" | "member",
    expiresIn: "1d" | "7d" | "30d",
  ) => {
    if (!currentProject) throw new Error("No project selected");
    return invite.mutateAsync({
      projectId: currentProject.id,
      role,
      expiresIn,
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  const hasProjects = projects.length > 0;

  if (!hasProjects) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-8xl mb-4">📁</div>
        <h2 className="text-2xl font-bold mb-2">Create your first project</h2>
        <p className="text-base-content/60 mb-6">
          Get started by creating or joining a project
        </p>
        <p className="text-sm text-base-content/70">
          Use the dropdown in the header to create or join a project
        </p>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Your Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSelectProject(project.id)}
            >
              <div className="card-body">
                <h3 className="card-title">{project.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`badge badge-sm ${project.role === "admin" ? "badge-primary" : "badge-ghost"}`}
                  >
                    {project.role}
                  </span>
                </div>
                <div className="text-sm text-base-content/60 mt-2">
                  {project.description || "No description"}
                </div>
                <div className="stats stats-horizontal shadow mt-4">
                  <div className="stat">
                    <div className="stat-figure text-primary">
                      <ListTodo className="h-6 w-6" />
                    </div>
                    <div className="stat-title">Total Tasks</div>
                    <div className="stat-value">
                      {projectStats.get(project.id)?.total ?? 0}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-figure text-error">
                      <Target className="h-6 w-6" />
                    </div>
                    <div className="stat-title">Overdue</div>
                    <div className="stat-value text-error">
                      {projectStats.get(project.id)?.overdue ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-xl flex justify-center items-center gap-2 font-bold">
          <span>{currentProject.name}</span>
          <span
            className={`badge badge-sm  ${currentProject.role === "admin" ? "badge-success" : "badge-outline"}`}
          >
            {currentProject.role}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setShowMembersModal(true)}
          >
            {members.length} members
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowInviteModal(true)}
          >
            Invite
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        {isProjectLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          ""
        )}

        <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden h-[calc(100%-120px)]">
          {STATUS_COLUMNS.map((column) => (
            <div
              key={column.key}
              className={`card ${column.color} p-4 overflow-y-auto`}
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                {column.label}
                <span className="badge badge-sm">
                  {tasksByStatus[column.key].length}
                </span>
              </h3>

              <div className="space-y-3">
                {tasksByStatus[column.key].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    members={members}
                    project={currentProject}
                    currentUserId={user?.id}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTask}
                  />
                ))}

                {tasksByStatus[column.key].length === 0 && (
                  <p className="text-sm text-base-content/40 text-center py-4">
                    No tasks
                  </p>
                )}

                <div className="flex justify-center mt-2">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowNewTask(true)}
                  >
                    + Add Task
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TaskForm
        isOpen={showNewTask}
        onClose={() => setShowNewTask(false)}
        onSubmit={handleCreateTask}
        project={currentProject}
        members={members}
        currentUserId={user?.id}
        className="w-96"
        isPending={createTask.isPending}
      />

      <MembersList
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        members={members}
        project={currentProject}
        currentUserId={user?.id}
        onRemoveMember={handleRemoveMember}
        tasks={tasks}
      />

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onGenerate={handleInvite}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
