import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide } from 'three';

const Node3D = ({ id, position, color, index = 0 }) => {
  const groupRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const orbit1Ref = useRef();
  const orbit2Ref = useRef();

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Orbital motion (parent groups)
    if (orbit1Ref.current) orbit1Ref.current.rotation.y += delta * 0.5;  // Horizontal orbit around Y
    if (orbit2Ref.current) orbit2Ref.current.rotation.z += delta * 0.7;  // Tilted orbit around Z

    // Self-spin (rings spin on their own Z axis)
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 1.0;
    if (ring2Ref.current) ring2Ref.current.rotation.z += delta * 1.5;

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

      {/* Orbit 1 - horizontal plane, rotates around Y axis */}
      <group ref={orbit1Ref}>
        <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.02, 8, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
        {/* Marker spheres on ring */}
        <mesh position={[0.8, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh position={[-0.8, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>

      {/* Orbit 2 - tilted plane, rotates around Y axis */}
      <group ref={orbit2Ref} rotation={[Math.PI / 4, 0, 0]}>
        <mesh ref={ring2Ref}>
          <torusGeometry args={[0.8, 0.02, 8, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
        {/* Marker spheres on ring */}
        <mesh position={[0.8, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh position={[-0.8, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
};

export default Node3D;
