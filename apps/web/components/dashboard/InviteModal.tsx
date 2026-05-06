import { useState } from "react";
import { Copy, X } from "lucide-react";
import { Modal } from "@/components/common";
import type { ProjectRole } from "@repo/types";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (role: ProjectRole, expiresIn: "1d" | "7d" | "30d") => Promise<{ inviteUrl: string }>;
}

export function InviteModal({ isOpen, onClose, onGenerate }: InviteModalProps) {
  const [role, setRole] = useState<ProjectRole>("member");
  const [expiresIn, setExpiresIn] = useState<"1d" | "7d" | "30d">("7d");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await onGenerate(role, expiresIn);
      setGeneratedLink(result.inviteUrl);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
    }
  };

  const handleClose = () => {
    setGeneratedLink(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite to Project" className="w-96">
      <div className="space-y-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Role</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={role}
            onChange={(e) => setRole(e.target.value as ProjectRole)}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Expires In</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={expiresIn}
            onChange={(e) => setExpiresIn(e.target.value as "1d" | "7d" | "30d")}
          >
            <option value="7d">7 Days</option>
            <option value="1d">1 Day</option>
            <option value="30d">30 Days</option>
          </select>
        </div>

        <button type="button" onClick={handleGenerate} className="btn btn-primary w-full">
          {isLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            "Generate Link"
          )}
        </button>
      </div>

      {generatedLink && (
        <div className="mt-4">
          <label className="label">
            <span className="label-text">Share this link</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input input-bordered input-sm flex-1"
              value={generatedLink}
              readOnly
            />
            <button className="btn btn-ghost btn-sm btn-square" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button className="btn btn-ghost flex-1" onClick={handleClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}