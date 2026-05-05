import { useState } from "react";
import { useProjectStore, useToastStore } from "@/stores";

interface JoinProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinProjectModal({ isOpen, onClose }: JoinProjectModalProps) {
  const [token, setToken] = useState("");
  const { fetchProjects } = useProjectStore();
  const { addToast } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

try {
      // TODO: Implement join project logic
      addToast("Joining project...", "info");
      setToken("");
      onClose();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to join project", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-base-100/50 backdrop-blur-sm flex items-center justify-center z-50">
      <fieldset className="fieldset bg-base-200 p-4 rounded-lg w-80">
        <legend className="fieldset-legend">Join Project</legend>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Invite Link</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste invite link here"
              required
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">
              Join
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