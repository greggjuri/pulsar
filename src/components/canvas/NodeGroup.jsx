import Node3D from './Node3D';
import { useGraphStore } from '../../stores/graphStore';

const NodeGroup = () => {
  const nodes = useGraphStore((s) => s.nodes);
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const selectNode = useGraphStore((s) => s.selectNode);

  return (
    <group>
      {nodes.map((node, index) => (
        <Node3D
          key={node.id}
          id={node.id}
          position={node.position}
          color={node.color}
          index={index}
          isSelected={selectedNodeId === node.id}
          onSelect={() => selectNode(node.id)}
        />
      ))}
    </group>
  );
};

export default NodeGroup;
