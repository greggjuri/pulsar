import { useGraphStore } from '../../stores/graphStore';

const ControlsPanel = () => {
  const triggerFit = useGraphStore((s) => s.triggerFit);
  const triggerReset = useGraphStore((s) => s.triggerReset);
  const toggleShortcuts = useGraphStore((s) => s.toggleShortcuts);
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const selectedEdgeId = useGraphStore((s) => s.selectedEdgeId);
  const connectingFromNodeId = useGraphStore((s) => s.connectingFromNodeId);
  const showLabels = useGraphStore((s) => s.showLabels);
  const showIcons = useGraphStore((s) => s.showIcons);
  const toggleLabels = useGraphStore((s) => s.toggleLabels);
  const toggleIcons = useGraphStore((s) => s.toggleIcons);

  return (
    <div className="absolute top-4 right-4 bg-black/50 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm pointer-events-auto">
      <div className="text-cyan-400 font-mono text-sm mb-3">CONTROLS</div>
      <div className="text-gray-400 text-xs space-y-1">
        <div>Drag to rotate</div>
        <div>Scroll to zoom</div>
        <div>Click node to select</div>
        <div>Click edge to select</div>
        <div>Drag selected to move</div>
        <div>Right-click for menu</div>
      </div>

      {/* Connecting mode hints */}
      {connectingFromNodeId && (
        <div className="mt-3 pt-3 border-t border-yellow-500/30">
          <div className="text-yellow-400 font-mono text-xs mb-2 animate-pulse">CONNECTING</div>
          <div className="text-gray-400 text-xs space-y-1">
            <div>Click target node</div>
            <div>ESC to cancel</div>
          </div>
        </div>
      )}

      {/* Selected node hints */}
      {selectedNodeId && !connectingFromNodeId && (
        <div className="mt-3 pt-3 border-t border-cyan-500/20">
          <div className="text-cyan-400 font-mono text-xs mb-2">SELECTED NODE</div>
          <div className="text-gray-400 text-xs space-y-1">
            <div>DEL to delete</div>
            <div>ESC to deselect</div>
          </div>
        </div>
      )}

      {/* Selected edge hints */}
      {selectedEdgeId && !connectingFromNodeId && (
        <div className="mt-3 pt-3 border-t border-cyan-500/20">
          <div className="text-cyan-400 font-mono text-xs mb-2">SELECTED EDGE</div>
          <div className="text-gray-400 text-xs space-y-1">
            <div>DEL to delete</div>
            <div>ESC to deselect</div>
          </div>
        </div>
      )}

      {/* View control buttons */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-cyan-500/20">
        <button
          onClick={triggerFit}
          className="flex-1 bg-black/50 border border-cyan-500/30 rounded p-2
                     hover:bg-cyan-500/20 hover:border-cyan-500/50
                     transition-colors text-cyan-400 flex items-center justify-center gap-1"
          title="Fit all nodes in view (F)"
        >
          <span>⊞</span>
          <span className="text-xs">Fit</span>
        </button>
        <button
          onClick={triggerReset}
          className="flex-1 bg-black/50 border border-cyan-500/30 rounded p-2
                     hover:bg-cyan-500/20 hover:border-cyan-500/50
                     transition-colors text-cyan-400 flex items-center justify-center gap-1"
          title="Reset camera (R)"
        >
          <span>↺</span>
          <span className="text-xs">Reset</span>
        </button>
        <button
          onClick={toggleShortcuts}
          className="flex-1 bg-black/50 border border-cyan-500/30 rounded p-2
                     hover:bg-cyan-500/20 hover:border-cyan-500/50
                     transition-colors text-cyan-400 flex items-center justify-center gap-1"
          title="Keyboard shortcuts (?)"
        >
          <span>?</span>
          <span className="text-xs">Help</span>
        </button>
      </div>

      {/* Display toggle buttons */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={toggleLabels}
          className={`flex-1 bg-black/50 border rounded p-2
                     transition-colors flex items-center justify-center gap-1
                     ${showLabels
                       ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/20'
                       : 'border-cyan-500/20 text-cyan-500/50 hover:bg-cyan-500/10'}`}
          title={`${showLabels ? 'Hide' : 'Show'} labels (L)`}
        >
          <span className="text-xs font-mono">LABEL</span>
        </button>
        <button
          onClick={toggleIcons}
          className={`flex-1 bg-black/50 border rounded p-2
                     transition-colors flex items-center justify-center gap-1
                     ${showIcons
                       ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/20'
                       : 'border-cyan-500/20 text-cyan-500/50 hover:bg-cyan-500/10'}`}
          title={`${showIcons ? 'Hide' : 'Show'} icons (I)`}
        >
          <span className="text-xs font-mono">ICON</span>
        </button>
      </div>
    </div>
  );
};

export default ControlsPanel;
