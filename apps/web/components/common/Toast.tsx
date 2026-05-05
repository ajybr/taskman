import { useToastStore, type Toast } from "@/stores/toastStore";

const TOAST_STYLES = {
  error: "alert-error",
  success: "alert-success",
  info: "alert-info",
};

export function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <div className="toast toast-bottom toast-center z-50">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore();

  return (
    <div className={`alert ${TOAST_STYLES[toast.type]} shadow-lg`}>
      <span>{toast.message}</span>
      <button
        className="btn btn-ghost btn-xs"
        onClick={() => removeToast(toast.id)}
      >
        ✕
      </button>
    </div>
  );
}