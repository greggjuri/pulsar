const NodeInfoPanel = ({ node, onClose }) => {
  if (!node) return null;

  return (
    <div className="absolute bottom-4 left-4 bg-black/70 border border-cyan-500/50 rounded-lg p-4 backdrop-blur-sm min-w-64 font-mono pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex justify-between items-start mb-3">
        <div
          className="text-cyan-400 text-lg"
          style={{ textShadow: '0 0 8px cyan' }}
        >
          {node.label}
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-cyan-400 text-xl leading-none transition-colors ml-4"
        >
          ×
        </button>
      </div>
      <div className="text-sm space-y-1">
        <div className="flex justify-between py-1 border-b border-gray-700">
          <span className="text-gray-400">Type:</span>
          <span className="text-cyan-300">{node.type?.toUpperCase() || 'SERVICE'}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-700">
          <span className="text-gray-400">ID:</span>
          <span className="text-cyan-300">{node.id}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-400">Status:</span>
          <span className="text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
};

export default NodeInfoPanel;
