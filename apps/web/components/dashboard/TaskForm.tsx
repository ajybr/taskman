import { useState } from "react";
import type { Project, ProjectMember, TaskPriority } from "@repo/types";
import { Modal } from "@/components/common";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description?: string;
    priority: TaskPriority;
    assignedTo: string | null;
    dueDate?: string;
  }) => void;
  project: Project | null;
  members: ProjectMember[];
  currentUserId: string | undefined;
  className?: string;
}

export function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  project,
  members,
  currentUserId,
  className = "",
}: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignee = project?.role === "admin" ? (assignedTo || null) : (currentUserId || null);

    if (!assignee) {
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      assignedTo: assignee,
      dueDate: dueDate || undefined,
    });

    setTitle("");
    setDescription("");
    setPriority("medium");
    setAssignedTo("");
    setDueDate("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Task" className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            required
            autoFocus
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={2}
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Priority <span className="text-error">*</span></span>
          </label>
          <select
            className="select select-bordered w-full"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Assign To <span className="text-error">*</span></span>
            {project?.role !== "admin" && (
              <span className="label-text-alt text-primary">Yourself</span>
            )}
          </label>
          {project?.role === "admin" ? (
            <select
              className="select select-bordered w-full"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              required
            >
              <option value="">Select assignee</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="input input-bordered w-full bg-base-300"
              value={currentUserId ? members.find((m) => m.userId === currentUserId)?.name || "" : ""}
              disabled
            />
          )}
          {project?.role !== "admin" && (
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                Members can only create tasks for themselves
              </span>
            </label>
          )}
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Due Date <span className="text-error">*</span></span>
          </label>
          <input
            type="date"
            className="input input-bordered w-full"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary flex-1" disabled={!title.trim() || (project?.role === "admin" && !assignedTo) || !dueDate}>
            Create
          </button>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}