const HeaderPanel = () => {
  return (
    <div className="absolute top-4 left-4 text-cyan-400 font-mono">
      <div
        className="text-2xl font-bold tracking-wider"
        style={{ textShadow: '0 0 10px cyan' }}
      >
        PULSAR
      </div>
      <div className="text-sm opacity-60 mt-1">AWS ARCHITECTURE VISUALIZER</div>
    </div>
  );
};

export default HeaderPanel;
