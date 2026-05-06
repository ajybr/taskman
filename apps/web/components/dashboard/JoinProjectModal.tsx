import { useState } from "react";
import { useProjectStore, useToastStore } from "@/stores";
import { api } from "@/lib/api";

interface JoinProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinProjectModal({ isOpen, onClose }: JoinProjectModalProps) {
  const [token, setToken] = useState("");
  const { fetchProjects } = useProjectStore();
  const { addToast } = useToastStore();

  const extractToken = (input: string): string => {
    const match = input.match(/\/invite\/([a-f0-9-]+)/i);
    if (match && match[1]) return match[1];
    return input;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    const tokenValue = extractToken(token);
    if (!tokenValue) return;

    try {
      addToast("Joining project...", "info");
      await api.invites.accept(tokenValue);
      await fetchProjects();
      addToast("Joined project successfully!", "success");
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
        <div className="space-y-4">
          <label className="floating-label input input-bordered w-full">
            <span>Invite Link</span>
            <input
              type="text"
              className="flex-1"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste invite link here"
              autoFocus
            />
          </label>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={handleSubmit} className="btn btn-primary flex-1">
            Join
          </button>
          <button type="button" className="btn flex-1" onClick={onClose}>
            Cancel
          </button>
        </div>
      </fieldset>
    </div>
  );
}