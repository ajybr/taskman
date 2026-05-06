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
        <div className="space-y-4">
          <label className="floating-label input input-bordered w-full">
            <span>Project Name</span>
            <input
              type="text"
              className="flex-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Project"
              autoFocus
            />
          </label>
          <label className="floating-label textarea textarea-bordered w-full">
            <span>Description (optional)</span>
            <textarea
              className="flex-1"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description"
              rows={2}
            />
          </label>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-primary flex-1"
          >
            {createProject.isPending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Create"
            )}
          </button>
          <button type="button" className="btn flex-1" onClick={onClose}>
            Cancel
          </button>
        </div>
      </fieldset>
    </div>
  );
}