import HeaderPanel from './HeaderPanel';
import ControlsPanel from './ControlsPanel';
import StatsPanel from './StatsPanel';
import CornerBrackets from './CornerBrackets';

const HudOverlay = ({ nodeCount, edgeCount }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)',
        }}
      />

      {/* HUD Panels */}
      <HeaderPanel />
      <ControlsPanel />
      <StatsPanel nodeCount={nodeCount} edgeCount={edgeCount} />
      <CornerBrackets />
    </div>
  );
};

export default HudOverlay;
