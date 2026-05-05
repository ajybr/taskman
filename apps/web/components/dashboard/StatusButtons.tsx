import type { TaskStatus } from "@repo/types";

interface StatusButtonsProps {
  status: TaskStatus;
  onChange: (status: TaskStatus) => void;
}

const STATUS_OPTIONS: { key: TaskStatus; label: string; btnClass: string }[] = [
  { key: "todo", label: "To Do", btnClass: "btn-neutral" },
  { key: "in_progress", label: "In Progress", btnClass: "btn-warning" },
  { key: "done", label: "Done", btnClass: "btn-success" },
];

export function StatusButtons({ status, onChange }: StatusButtonsProps) {
  return (
    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          className={`btn btn-xs flex-1 ${
            status === option.key ? `btn-solid ${option.btnClass}` : `btn-soft ${option.btnClass}`
          }`}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}