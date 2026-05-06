import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore, useToastStore } from "@/stores";
import { useCreateProject } from "@/hooks";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createProject = useCreateProject();
  const { addToast } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const project = await createProject.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      addToast("Project created", "success");
      setName("");
      setDescription("");
      onClose();
      router.push(`/dashboard?projectId=${project.id}`);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to create project");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-base-100/50 backdrop-blur-sm flex items-center justify-center z-50">
      <fieldset className="fieldset bg-base-200 p-4 rounded-lg w-80">
        <legend className="fieldset-legend">New Project</legend>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Project Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Project"
              required
              autoFocus
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description (optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description"
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={!name.trim() || createProject.isPending}
            >
              {createProject.isPending ? "Creating..." : "Create"}
            </button>
            <button type="button" className="btn flex-1" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </fieldset>
    </div>
  );
}