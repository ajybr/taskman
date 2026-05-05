interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className = "" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-base-100/50 backdrop-blur-sm flex items-center justify-center z-50">
      <fieldset className={`fieldset bg-base-200 p-4 rounded-lg ${className}`}>
        <legend className="fieldset-legend">{title}</legend>
        {children}
      </fieldset>
    </div>
  );
}