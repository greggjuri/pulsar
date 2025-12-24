import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide } from 'three';

const Node3D = ({ id, position, color, index = 0 }) => {
  const groupRef = useRef();
  const orbit1Ref = useRef();
  const orbit2Ref = useRef();

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Orbit 1 - ring sweeps front-to-back (rotate around X axis)
    if (orbit1Ref.current) {
      orbit1Ref.current.rotation.x += delta * 0.5;
    }

    // Orbit 2 - ring sweeps side-to-side (rotate around Z axis)
    if (orbit2Ref.current) {
      orbit2Ref.current.rotation.z += delta * 0.4;
    }

    // Bobbing
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

      {/* Orbit 1 */}
      <group ref={orbit1Ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.02, 8, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.8, 0, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>

      {/* Orbit 2 */}
      <group ref={orbit2Ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.02, 8, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.8, 0, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
};

export default Node3D;
