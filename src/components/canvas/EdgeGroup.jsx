import { useMemo } from 'react';
import Edge3D from './Edge3D';

const EdgeGroup = ({ edges, nodes }) => {
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

        return (
          <Edge3D
            key={edge.id}
            start={startPos}
            end={endPos}
            style={edge.style}
            animated={edge.animated}
          />
        );
      })}
    </group>
  );
};

export default EdgeGroup;
