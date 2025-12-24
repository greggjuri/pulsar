const ControlsPanel = () => {
  return (
    <div className="absolute top-4 right-4 bg-black/50 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm pointer-events-auto">
      <div className="text-cyan-400 font-mono text-sm mb-3">CONTROLS</div>
      <div className="text-gray-400 text-xs space-y-1">
        <div>Drag to rotate</div>
        <div>Scroll to zoom</div>
        <div>Click node to select</div>
        <div>Drag selected to move</div>
      </div>
    </div>
  );
};

export default ControlsPanel;
