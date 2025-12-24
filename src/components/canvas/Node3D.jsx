import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide } from 'three';

const Node3D = ({ id, position, color, index = 0 }) => {
  const groupRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Ring rotation (delta-based for frame-rate independence)
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.5;
    if (ring2Ref.current) ring2Ref.current.rotation.z += delta * 0.75;

    // Bobbing (offset by index to desync)
    if (groupRef.current) {
      const baseY = position[1];
      groupRef.current.position.y = baseY + Math.sin(time * 2 + index) * 0.1;
    }
  });

  return (
    <group position={position} ref={groupRef}>
      {/* Core */}
      <mesh>
        <icosahedronGeometry args={[0.5, 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>

      {/* Glow */}
      <mesh>
        <icosahedronGeometry args={[0.7, 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} side={BackSide} />
      </mesh>

      {/* Ring 1 - horizontal */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.02, 8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>

      {/* Ring 2 - angled */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[0.8, 0.02, 8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

export default Node3D;
