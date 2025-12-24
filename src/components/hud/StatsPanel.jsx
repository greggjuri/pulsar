const StatsPanel = ({ nodeCount, edgeCount }) => {
  return (
    <div className="absolute bottom-4 right-4 bg-black/50 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm font-mono text-xs pointer-events-auto">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-400">
        <span>Nodes:</span>
        <span className="text-cyan-400">{nodeCount}</span>
        <span>Connections:</span>
        <span className="text-cyan-400">{edgeCount}</span>
        <span>Data Flow:</span>
        <span className="text-green-400 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          ACTIVE
        </span>
      </div>
    </div>
  );
};

export default StatsPanel;
