import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide } from 'three';

const Node3D = ({ id, position, color, index = 0, isSelected = false, onSelect }) => {
  const groupRef = useRef();
  const orbit1Ref = useRef();
  const orbit2Ref = useRef();
  const marker1Ref = useRef();
  const marker2Ref = useRef();
  const highlightRef = useRef();
  const pointerDownPos = useRef(null);

  // Scale pulse animation state
  const [pulseScale, setPulseScale] = useState(1);
  const pulseRef = useRef({ active: false, scale: 1 });

  // Trigger scale pulse when selected
  useEffect(() => {
    if (isSelected) {
      pulseRef.current = { active: true, scale: 1.15 };
    }
  }, [isSelected]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Orbit 1 - ring sweeps front-to-back
    if (orbit1Ref.current) {
      orbit1Ref.current.rotation.x += delta * 0.5;
    }
    // Marker 1 - orbits along the ring
    if (marker1Ref.current) {
      marker1Ref.current.rotation.y += delta * 0.8;
    }

    // Orbit 2 - ring sweeps side-to-side
    if (orbit2Ref.current) {
      orbit2Ref.current.rotation.z += delta * 0.4;
    }
    // Marker 2 - orbits along the ring
    if (marker2Ref.current) {
      marker2Ref.current.rotation.y += delta * 0.6;
    }

    // Highlight ring rotation (faster)
    if (highlightRef.current) {
      highlightRef.current.rotation.z += delta * 1.2;
    }

    // Scale pulse animation
    if (pulseRef.current.active) {
      pulseRef.current.scale += (1 - pulseRef.current.scale) * delta * 8;
      if (Math.abs(pulseRef.current.scale - 1) < 0.01) {
        pulseRef.current.active = false;
        pulseRef.current.scale = 1;
      }
    }

    // Bobbing + scale
    if (groupRef.current) {
      const baseY = position[1];
      groupRef.current.position.y = baseY + Math.sin(time * 2 + index) * 0.1;
      const scale = pulseRef.current.scale;
      groupRef.current.scale.set(scale, scale, scale);
    }
  });

  // Click vs drag detection
  const handlePointerDown = (e) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e) => {
    if (!pointerDownPos.current) return;
    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5 && onSelect) {
      onSelect();
      e.stopPropagation();
    }
    pointerDownPos.current = null;
  };

  // Opacity values based on selection
  const coreOpacity = isSelected ? 1.0 : 0.9;
  const glowOpacity = isSelected ? 0.4 : 0.2;

  return (
    <group position={position} ref={groupRef}>
      {/* Clickable area */}
      <mesh
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Core */}
      <mesh>
        <icosahedronGeometry args={[0.5, 2]} />
        <meshBasicMaterial color={color} transparent opacity={coreOpacity} />
      </mesh>

      {/* Glow */}
      <mesh>
        <icosahedronGeometry args={[0.7, 2]} />
        <meshBasicMaterial color={color} transparent opacity={glowOpacity} side={BackSide} />
      </mesh>

      {/* Selection highlight ring */}
      {isSelected && (
        <group ref={highlightRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.9, 0.04, 8, 32]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
          </mesh>
        </group>
      )}

      {/* Orbit 1 */}
      <group ref={orbit1Ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.02, 8, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
        <group ref={marker1Ref}>
          <mesh position={[0.8, 0, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>
      </group>

      {/* Orbit 2 */}
      <group ref={orbit2Ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.02, 8, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
        <group ref={marker2Ref}>
          <mesh position={[0.8, 0, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default Node3D;
