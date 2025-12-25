import Node3D from './Node3D';
import { useGraphStore } from '../../stores/graphStore';

const NodeGroup = ({ onContextMenu }) => {
  const nodes = useGraphStore((s) => s.nodes);
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const connectingFromNodeId = useGraphStore((s) => s.connectingFromNodeId);
  const selectNode = useGraphStore((s) => s.selectNode);
  const addEdge = useGraphStore((s) => s.addEdge);
  const setDraggingNode = useGraphStore((s) => s.setDraggingNode);
  const clearDraggingNode = useGraphStore((s) => s.clearDraggingNode);
  const updateNodePosition = useGraphStore((s) => s.updateNodePosition);

  const handleNodeSelect = (nodeId) => {
    // If in connecting mode, create edge instead of selecting
    if (connectingFromNodeId) {
      addEdge(connectingFromNodeId, nodeId);
    } else {
      selectNode(nodeId);
    }
  };

  return (
    <group>
      {nodes.map((node, index) => (
        <Node3D
          key={node.id}
          id={node.id}
          position={node.position}
          color={node.color}
          type={node.type}
          index={index}
          isSelected={selectedNodeId === node.id}
          isConnectingSource={connectingFromNodeId === node.id}
          onSelect={() => handleNodeSelect(node.id)}
          onContextMenu={(e) => onContextMenu?.(e, 'node', node)}
          onDragStart={() => setDraggingNode(node.id)}
          onDrag={(pos) => updateNodePosition(node.id, pos)}
          onDragEnd={() => clearDraggingNode()}
          allNodes={nodes}
        />
      ))}
    </group>
  );
};

export default NodeGroup;
