import { SHORTCUTS } from '../../data/shortcuts';

/**
 * ShortcutsPanel - Modal displaying all keyboard shortcuts
 * Opens with ? key, closes with ?, ESC, or clicking backdrop
 */
const ShortcutsPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[10000]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-gray-950/95 border border-cyan-500/30 rounded-lg p-6 max-w-md shadow-lg shadow-cyan-500/10">
        {/* Header */}
        <h2 className="text-cyan-400 font-mono text-lg mb-4 tracking-wider">
          KEYBOARD SHORTCUTS
        </h2>

        {/* Categories */}
        {SHORTCUTS.map((category) => (
          <div key={category.category} className="mb-4">
            <h3 className="text-cyan-600 text-xs uppercase tracking-wide mb-2">
              {category.category}
            </h3>
            {category.shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm mb-1.5"
              >
                <span className="text-gray-400">{shortcut.description}</span>
                <span className="font-mono text-cyan-300 text-xs bg-cyan-500/10 px-2 py-0.5 rounded">
                  {shortcut.keys.join(' / ')}
                </span>
              </div>
            ))}
          </div>
        ))}

        {/* Close hint */}
        <div className="text-gray-600 text-xs mt-4 text-center border-t border-cyan-500/20 pt-3">
          Press <span className="text-cyan-500 font-mono">?</span> or{' '}
          <span className="text-cyan-500 font-mono">ESC</span> to close
        </div>
      </div>
    </div>
  );
};

export default ShortcutsPanel;
