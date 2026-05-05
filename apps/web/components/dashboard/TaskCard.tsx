import { Trash2, Calendar } from "lucide-react";
import type { Task, ProjectMember, Project } from "@repo/types";
import { StatusButtons } from "./StatusButtons";

const PRIORITY_COLORS = {
  low: "badge-info",
  medium: "badge-warning",
  high: "badge-error",
};

interface TaskCardProps {
  task: Task;
  members: ProjectMember[];
  project: Project | null;
  currentUserId: string | undefined;
  onStatusChange: (taskId: string, status: Task["status"]) => void;
  onDelete: (taskId: string) => void;
}

function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  return `${day} ${month}`;
}

export function TaskCard({
  task,
  members,
  project,
  currentUserId,
  onStatusChange,
  onDelete,
}: TaskCardProps) {
  const getMemberName = (userId: string | null) => {
    if (!userId) return null;
    const member = members.find((m) => m.userId === userId);
    return member?.name || null;
  };

  const canChangeStatus = project?.role === "admin" || task.assignedTo === currentUserId;

  return (
    <div className="card bg-base-100 shadow-md compact group hover:shadow-xl transition-shadow">
      <div className="card-body p-3">
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium text-sm">{task.title}</span>
          <button
            className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 btn-error btn-square"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className={`badge badge-xs ${PRIORITY_COLORS[task.priority]}`}>
            {task.priority}
          </span>
          {project?.role === "admin" && task.assignedTo && getMemberName(task.assignedTo) && (
            <div
              className="w-5 h-5 rounded-full bg-secondary text-secondary-content flex items-center justify-center text-xs font-medium tooltip tooltip-top"
              data-tip={getMemberName(task.assignedTo) || undefined}
            >
              {getMemberName(task.assignedTo)?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {task.description && (
          <p className="text-sm text-base-content/70 mt-2 line-clamp-3">
            {task.description}
          </p>
        )}

        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-base-content/50 mt-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDueDate(task.dueDate)}</span>
          </div>
        )}

        {canChangeStatus && (
          <StatusButtons
            status={task.status}
            onChange={(status) => onStatusChange(task.id, status)}
          />
        )}
      </div>
    </div>
  );
}