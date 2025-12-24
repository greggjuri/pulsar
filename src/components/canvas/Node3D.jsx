import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide } from 'three';
import useDrag from '../../hooks/useDrag';
import { checkCollision } from '../../utils/collision';

const Node3D = ({
  id,
  position,
  color,
  index = 0,
  isSelected = false,
  onSelect,
  onDragStart,
  onDrag,
  onDragEnd,
  allNodes = [],
}) => {
  const groupRef = useRef();
  const orbit1Ref = useRef();
  const orbit2Ref = useRef();
  const marker1Ref = useRef();
  const marker2Ref = useRef();
  const highlightRef = useRef();
  const pointerDownPos = useRef(null);
  const originalPositionRef = useRef(null);

  // Scale pulse animation state
  const pulseRef = useRef({ active: false, scale: 1 });

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [hasCollision, setHasCollision] = useState(false);

  // Drag hook
  const { startDrag, updateDrag } = useDrag();

  // Trigger scale pulse when selected
  useEffect(() => {
    if (isSelected) {
      pulseRef.current = { active: true, scale: 1.15 };
    }
  }, [isSelected]);

  // Update cursor based on state
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'grabbing';
    } else if (isSelected) {
      document.body.style.cursor = 'grab';
    }

    return () => {
      if (isDragging || isSelected) {
        document.body.style.cursor = 'default';
      }
    };
  }, [isDragging, isSelected]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Handle drag updates in animation frame for smooth movement
    if (isDragging) {
      const newPos = updateDrag();
      if (newPos) {
        const collision = checkCollision(id, newPos, allNodes);
        setHasCollision(collision);
        onDrag?.(newPos);
      }
    }

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

  const handlePointerDown = (e) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };

    // Only start drag for already selected nodes
    if (isSelected) {
      originalPositionRef.current = [...position];
      startDrag(position);
      setIsDragging(true);
      setHasCollision(false);
      onDragStart?.();
      e.stopPropagation();
    }
  };

  const handlePointerUp = (e) => {
    if (!pointerDownPos.current) return;

    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (isDragging) {
      // End drag - snap back if collision
      if (hasCollision && originalPositionRef.current) {
        onDrag?.(originalPositionRef.current);
      }
      setIsDragging(false);
      setHasCollision(false);
      onDragEnd?.();
      originalPositionRef.current = null;
    } else if (distance < 5 && onSelect) {
      // This was a click, not a drag
      onSelect();
      e.stopPropagation();
    }

    pointerDownPos.current = null;
  };

  // Handle pointer leaving the canvas during drag
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerUp = () => {
      if (hasCollision && originalPositionRef.current) {
        onDrag?.(originalPositionRef.current);
      }
      setIsDragging(false);
      setHasCollision(false);
      onDragEnd?.();
      originalPositionRef.current = null;
      pointerDownPos.current = null;
    };

    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, [isDragging, hasCollision, onDrag, onDragEnd]);

  // Determine display color based on collision state
  const displayColor = isDragging && hasCollision ? '#ff4444' : color;

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
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Core */}
      <mesh>
        <icosahedronGeometry args={[0.5, 2]} />
        <meshBasicMaterial color={displayColor} transparent opacity={coreOpacity} />
      </mesh>

      {/* Glow */}
      <mesh>
        <icosahedronGeometry args={[0.7, 2]} />
        <meshBasicMaterial color={displayColor} transparent opacity={glowOpacity} side={BackSide} />
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
          <meshBasicMaterial color={displayColor} transparent opacity={0.6} />
        </mesh>
        <group ref={marker1Ref}>
          <mesh position={[0.8, 0, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color={displayColor} />
          </mesh>
        </group>
      </group>

      {/* Orbit 2 */}
      <group ref={orbit2Ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.02, 8, 32]} />
          <meshBasicMaterial color={displayColor} transparent opacity={0.6} />
        </mesh>
        <group ref={marker2Ref}>
          <mesh position={[0.8, 0, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color={displayColor} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default Node3D;
