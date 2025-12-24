import { Box3, Vector3, Sphere } from 'three';

// Constants - match App.jsx initial camera position
export const DEFAULT_CAMERA_POSITION = [0, 8, 15];
export const DEFAULT_CAMERA_TARGET = [0, 0, 0];
export const CAMERA_LERP_SPEED = 0.08; // ~500ms to complete
export const FIT_PADDING = 1.5; // Breathing room multiplier
export const MIN_FIT_DISTANCE = 8; // Minimum distance for single/no nodes

/**
 * Calculate bounding sphere for all nodes
 * @param {Array} nodes - Array of node objects with position [x, y, z]
 * @returns {{ center: Vector3, radius: number } | null}
 */
export const calculateBounds = (nodes) => {
  if (!nodes || nodes.length === 0) return null;

  const box = new Box3();
  nodes.forEach((node) => {
    box.expandByPoint(new Vector3(...node.position));
  });

  const center = new Vector3();
  const sphere = new Sphere();
  box.getBoundingSphere(sphere);
  box.getCenter(center);

  return {
    center,
    radius: Math.max(sphere.radius, 1), // Minimum radius of 1 for single nodes
  };
};

/**
 * Calculate camera position to fit all nodes in view
 * @param {Camera} camera - Three.js camera
 * @param {{ center: Vector3, radius: number }} bounds - Bounding sphere
 * @param {number} padding - Padding multiplier (default 1.5)
 * @returns {{ position: Vector3, target: Vector3 }}
 */
export const calculateFitPosition = (camera, bounds, padding = FIT_PADDING) => {
  const { center, radius } = bounds;

  // Calculate distance needed to fit sphere in view
  const fov = camera.fov * (Math.PI / 180);
  let distance = (radius * padding) / Math.sin(fov / 2);

  // Enforce minimum distance
  distance = Math.max(distance, MIN_FIT_DISTANCE);

  // Get current camera direction (normalized)
  const direction = new Vector3();
  camera.getWorldDirection(direction);
  direction.negate(); // Point away from target

  // New camera position: center + direction * distance
  const position = center.clone().add(direction.multiplyScalar(distance));

  return {
    position,
    target: center.clone(),
  };
};
