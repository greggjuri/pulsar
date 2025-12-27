import ControlsPanel from './ControlsPanel';
import CornerBrackets from './CornerBrackets';
import NodeInfoPanel from './NodeInfoPanel';
import EdgeInfoPanel from './EdgeInfoPanel';
import FileControlsPanel from './FileControlsPanel';
import ContextMenu from './ContextMenu';
import { useGraphStore } from '../../stores/graphStore';

const HudOverlay = ({ contextMenu, onCloseContextMenu }) => {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const selectedEdgeId = useGraphStore((s) => s.selectedEdgeId);
  const clearSelection = useGraphStore((s) => s.clearSelection);

  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId)
    : null;

  const selectedEdge = selectedEdgeId
    ? edges.find((e) => e.id === selectedEdgeId)
    : null;

  // Get source/target node labels for EdgeInfoPanel
  const sourceNode = selectedEdge
    ? nodes.find((n) => n.id === selectedEdge.source)
    : null;
  const targetNode = selectedEdge
    ? nodes.find((n) => n.id === selectedEdge.target)
    : null;

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
      <FileControlsPanel />
      <ControlsPanel />
      <CornerBrackets />

      {/* Node Info Panel - shown when a node is selected */}
      {selectedNode && (
        <NodeInfoPanel node={selectedNode} onClose={clearSelection} />
      )}

      {/* Edge Info Panel - shown when an edge is selected */}
      {selectedEdge && (
        <EdgeInfoPanel
          edge={selectedEdge}
          sourceNode={sourceNode}
          targetNode={targetNode}
          onClose={clearSelection}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={onCloseContextMenu}
        />
      )}
    </div>
  );
};

export default HudOverlay;
