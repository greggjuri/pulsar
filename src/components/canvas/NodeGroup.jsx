import Node3D from './Node3D';

const NodeGroup = ({ nodes }) => {
  return (
    <group>
      {nodes.map((node, index) => (
        <Node3D
          key={node.id}
          id={node.id}
          position={node.position}
          color={node.color}
          index={index}
        />
      ))}
    </group>
  );
};

export default NodeGroup;
