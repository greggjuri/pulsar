import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 5;
const PARTICLE_SPEED = 0.3;

const Edge3D = ({ start, end, color = '#00ffff', style = 'solid', animated = true }) => {
  const lineRef = useRef();
  const particlesRef = useRef();
  const offsetsRef = useRef(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => i / PARTICLE_COUNT)
  );

  // Create curve and points (memoized)
  const { curve, points } = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);

    // Midpoint raised on Y for arc effect
    const mid = new THREE.Vector3()
      .addVectors(startVec, endVec)
      .multiplyScalar(0.5);
    mid.y += 0.5;

    const curve = new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
    const points = curve.getPoints(50);

    return { curve, points };
  }, [start, end]);

  // Compute line distances for dashed lines
  useMemo(() => {
    if (lineRef.current && style === 'dashed') {
      lineRef.current.computeLineDistances();
    }
  }, [style, points]);

  // Particle animation
  useFrame((_, delta) => {
    if (!animated || !particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array;

    offsetsRef.current = offsetsRef.current.map((offset, i) => {
      const newOffset = (offset + delta * PARTICLE_SPEED) % 1;
      const point = curve.getPoint(newOffset);

      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;

      return newOffset;
    });

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  // Initial particle positions
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    offsetsRef.current.forEach((offset, i) => {
      const point = curve.getPoint(offset);
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    });
    return positions;
  }, [curve]);

  const lineColor = style === 'dashed' ? '#00ffff' : '#00ff88';
  const lineOpacity = style === 'dashed' ? 0.4 : 0.5;

  return (
    <group>
      {/* Edge line */}
      {style === 'dashed' ? (
        <line ref={lineRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={points.length}
              array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineDashedMaterial
            color={lineColor}
            transparent
            opacity={lineOpacity}
            dashSize={0.3}
            gapSize={0.15}
          />
        </line>
      ) : (
        <line ref={lineRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={points.length}
              array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={lineColor}
            transparent
            opacity={lineOpacity}
          />
        </line>
      )}

      {/* Animated particles */}
      {animated && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={PARTICLE_COUNT}
              array={particlePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            color={color}
            size={0.15}
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
};

export default Edge3D;
