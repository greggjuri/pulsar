export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}) {
  const confirmColor =
    variant === 'danger'
      ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30'
      : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-black/95 border border-cyan-500/30 p-6 max-w-md mx-4">
        <h3 className="font-mono text-lg text-cyan-400 mb-3">{title}</h3>
        <p className="font-mono text-sm text-gray-300 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 font-mono text-sm text-gray-400
                       border border-gray-600/50 hover:bg-gray-600/20
                       transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 font-mono text-sm border transition-colors ${confirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
