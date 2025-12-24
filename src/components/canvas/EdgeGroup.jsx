import { useMemo } from 'react';
import Edge3D from './Edge3D';
import { useGraphStore } from '../../stores/graphStore';

const EdgeGroup = ({ onContextMenu }) => {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const selectedEdgeId = useGraphStore((s) => s.selectedEdgeId);
  const selectEdge = useGraphStore((s) => s.selectEdge);

  // Create node position lookup map
  const nodeMap = useMemo(() => {
    const map = {};
    nodes.forEach(node => {
      map[node.id] = node.position;
    });
    return map;
  }, [nodes]);

  return (
    <group>
      {edges.map(edge => {
        const startPos = nodeMap[edge.source];
        const endPos = nodeMap[edge.target];

        // Skip edge if nodes not found
        if (!startPos || !endPos) {
          console.warn(`Edge ${edge.id}: missing node ${!startPos ? edge.source : edge.target}`);
          return null;
        }

        // Key includes positions to force geometry recreation when nodes move
        const posKey = `${edge.id}-${startPos.join(',')}-${endPos.join(',')}`;

        return (
          <Edge3D
            key={posKey}
            start={startPos}
            end={endPos}
            style={edge.style}
            animated={edge.animated}
            isSelected={selectedEdgeId === edge.id}
            onSelect={() => selectEdge(edge.id)}
            onContextMenu={(e) => onContextMenu?.(e, 'edge', edge)}
          />
        );
      })}
    </group>
  );
};

export default EdgeGroup;
