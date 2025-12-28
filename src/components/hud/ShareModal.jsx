import { useState } from 'react';
import { useCloudStore } from '../../stores/cloudStore';

export function ShareModal({ diagram, onClose }) {
  const updateDiagramPublic = useCloudStore((s) => s.updateDiagramPublic);
  const isLoading = useCloudStore((s) => s.isLoading);

  const [isPublic, setIsPublic] = useState(diagram.isPublic || false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const shareUrl = `https://pulsar.jurigregg.com/view/${diagram.id}`;

  const handleToggle = async () => {
    const newValue = !isPublic;
    setError(null);

    const success = await updateDiagramPublic(diagram.id, newValue);
    if (success) {
      setIsPublic(newValue);
    } else {
      setError('Failed to update sharing settings');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-black/95 border border-cyan-500/30 p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-mono text-lg text-cyan-400">Share Diagram</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Diagram name */}
        <p className="font-mono text-sm text-gray-400 mb-4 truncate">
          {diagram.name}
        </p>

        {/* Public toggle */}
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono text-sm text-gray-300">Public Access</span>
          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`
              relative w-14 h-7 rounded-full transition-colors
              ${isPublic ? 'bg-cyan-500/30 border-cyan-500/50' : 'bg-gray-700/50 border-gray-600/50'}
              border
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span
              className={`
                absolute top-1 w-5 h-5 rounded-full transition-all
                ${isPublic ? 'left-8 bg-cyan-400' : 'left-1 bg-gray-400'}
              `}
            />
          </button>
        </div>

        {/* Share link (only shown when public) */}
        {isPublic && (
          <div className="mb-4">
            <label className="font-mono text-xs text-gray-500 mb-2 block">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-gray-900/50 border border-gray-600/50 px-3 py-2
                         font-mono text-xs text-gray-300 select-all"
              />
              <button
                onClick={handleCopy}
                className={`
                  px-3 py-2 font-mono text-xs border transition-colors
                  ${copied
                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                    : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30'
                  }
                `}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="font-mono text-xs text-gray-500 mt-2">
              Anyone with this link can view (read-only)
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="font-mono text-xs text-red-400 mb-4">{error}</p>
        )}

        {/* Close button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 font-mono text-sm text-gray-400
                     border border-gray-600/50 hover:bg-gray-600/20
                     transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
