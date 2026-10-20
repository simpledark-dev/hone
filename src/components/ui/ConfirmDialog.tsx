import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, body, confirmLabel, danger, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="animate-rise w-full max-w-md rounded-card bg-surface p-5 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-lg font-extrabold text-ink">
          {title}
        </h2>
        {body && <p className="mt-1 text-sm text-ink-2">{body}</p>}
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" size="md" full onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} size="md" full onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
