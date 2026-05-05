import { X } from "lucide-react";
import { Modal } from "@/components/common";
import type { Project, ProjectMember, Task, TaskStatus } from "@repo/types";

interface MembersListProps {
  isOpen: boolean;
  onClose: () => void;
  members: ProjectMember[];
  project: Project | null;
  currentUserId: string | undefined;
  onRemoveMember: (userId: string) => void;
  tasks?: Task[];
}

export function MembersList({
  isOpen,
  onClose,
  members,
  project,
  currentUserId,
  onRemoveMember,
  tasks = [],
}: MembersListProps) {
  const getMemberTaskCounts = (userId: string) => {
    const memberTasks = tasks.filter((t) => t.assignedTo === userId);
    const counts = {
      todo: 0,
      in_progress: 0,
      done: 0,
    };
    memberTasks.forEach((task) => {
      if (task.status === "todo") counts.todo++;
      else if (task.status === "in_progress") counts.in_progress++;
      else if (task.status === "done") counts.done++;
    });
    return counts;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Team Members"
      className="w-96 max-h-[80vh] overflow-y-auto"
    >
      <div className="text-sm font-medium mb-4">
        Total Members: {members.length}
      </div>
      <div className="space-y-2">
        {members.map((member, index) => {
          const taskCounts = getMemberTaskCounts(member.userId);
          return (
            <div
              key={member.userId}
              className="flex items-center justify-between p-2 bg-base-100 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl font-thin opacity-30 tabular-nums w-6">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-medium">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium">{member.name}</div>
                  <div className="text-xs text-base-content/60">
                    {member.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {tasks.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="badge badge-soft badge-sm badge-info">
                      {taskCounts.todo}
                    </span>
                    <span className="badge badge-soft badge-sm badge-warning">
                      {taskCounts.in_progress}
                    </span>
                    <span className="badge badge-soft badge-sm badge-success">
                      {taskCounts.done}
                    </span>
                  </div>
                )}
                {member.role === "admin" && (
                  <span className="badge badge-sm  badge-success">admin</span>
                )}
                {project?.role === "admin" &&
                  member.userId !== currentUserId && (
                    <button
                      className="btn btn-ghost btn-xs btn-square"
                      onClick={() => onRemoveMember(member.userId)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      <button className="btn btn-ghost btn-sm w-full mt-4" onClick={onClose}>
        Close
      </button>
    </Modal>
  );
}

