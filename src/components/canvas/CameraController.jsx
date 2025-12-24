import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGraphStore } from '../../stores/graphStore';
import {
  calculateBounds,
  calculateFitPosition,
  DEFAULT_CAMERA_POSITION,
  DEFAULT_CAMERA_TARGET,
  CAMERA_LERP_SPEED,
} from '../../utils/camera';

/**
 * CameraController handles animated camera movements (fit/reset)
 * Must receive controlsRef from parent to update OrbitControls target
 */
const CameraController = ({ controlsRef }) => {
  const { camera } = useThree();
  const nodes = useGraphStore((s) => s.nodes);
  const cameraAction = useGraphStore((s) => s.cameraAction);
  const clearCameraAction = useGraphStore((s) => s.clearCameraAction);
  const draggingNodeId = useGraphStore((s) => s.draggingNodeId);

  // Animation state
  const targetPosition = useRef(null);
  const targetTarget = useRef(null);
  const isAnimating = useRef(false);

  // Handle camera action triggers
  useEffect(() => {
    if (!cameraAction || draggingNodeId) {
      // Ignore actions while dragging
      if (cameraAction && draggingNodeId) {
        clearCameraAction();
      }
      return;
    }

    if (cameraAction === 'fit') {
      const bounds = calculateBounds(nodes);
      if (bounds) {
        const { position, target } = calculateFitPosition(camera, bounds);
        targetPosition.current = position;
        targetTarget.current = target;
        isAnimating.current = true;
      }
      clearCameraAction();
    } else if (cameraAction === 'reset') {
      targetPosition.current = new Vector3(...DEFAULT_CAMERA_POSITION);
      targetTarget.current = new Vector3(...DEFAULT_CAMERA_TARGET);
      isAnimating.current = true;
      clearCameraAction();
    }
  }, [cameraAction, nodes, camera, clearCameraAction, draggingNodeId]);

  // Animate camera movement
  useFrame(() => {
    if (!isAnimating.current || !targetPosition.current || !targetTarget.current) {
      return;
    }

    const controls = controlsRef?.current;
    if (!controls) return;

    // Lerp camera position
    camera.position.lerp(targetPosition.current, CAMERA_LERP_SPEED);
    controls.target.lerp(targetTarget.current, CAMERA_LERP_SPEED);
    controls.update();

    // Check if animation is complete (close enough)
    const positionDist = camera.position.distanceTo(targetPosition.current);
    const targetDist = controls.target.distanceTo(targetTarget.current);

    if (positionDist < 0.01 && targetDist < 0.01) {
      // Snap to final position
      camera.position.copy(targetPosition.current);
      controls.target.copy(targetTarget.current);
      controls.update();

      // Clear animation state
      targetPosition.current = null;
      targetTarget.current = null;
      isAnimating.current = false;
    }
  });

  // Stop animation if user starts interacting with controls
  useEffect(() => {
    const controls = controlsRef?.current;
    if (!controls) return;

    const handleStart = () => {
      if (isAnimating.current) {
        targetPosition.current = null;
        targetTarget.current = null;
        isAnimating.current = false;
      }
    };

    controls.addEventListener('start', handleStart);
    return () => controls.removeEventListener('start', handleStart);
  }, [controlsRef]);

  return null; // This component only handles logic, no rendering
};

export default CameraController;
