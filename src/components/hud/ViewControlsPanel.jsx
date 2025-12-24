import { useGraphStore } from '../../stores/graphStore';

const ViewControlsPanel = () => {
  const triggerFit = useGraphStore((s) => s.triggerFit);
  const triggerReset = useGraphStore((s) => s.triggerReset);

  return (
    <div className="absolute top-32 right-4 bg-black/50 border border-cyan-500/30 rounded-lg p-2 backdrop-blur-sm pointer-events-auto">
      <div className="flex gap-2">
        <button
          onClick={triggerFit}
          className="bg-black/50 border border-cyan-500/30 rounded p-2
                     hover:bg-cyan-500/20 hover:border-cyan-500/50
                     transition-colors text-cyan-400 w-9 h-9 flex items-center justify-center"
          title="Fit all nodes in view (F)"
        >
          <span className="text-lg">⊞</span>
        </button>
        <button
          onClick={triggerReset}
          className="bg-black/50 border border-cyan-500/30 rounded p-2
                     hover:bg-cyan-500/20 hover:border-cyan-500/50
                     transition-colors text-cyan-400 w-9 h-9 flex items-center justify-center"
          title="Reset camera (R)"
        >
          <span className="text-lg">↺</span>
        </button>
      </div>
    </div>
  );
};

export default ViewControlsPanel;
