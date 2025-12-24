import { useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { Plane, Vector3 } from 'three';

/**
 * Hook for handling 3D drag operations on a horizontal (XZ) plane.
 * Nodes stay at their original Y height, only moving horizontally.
 */
const useDrag = () => {
  const { camera, raycaster, pointer } = useThree();

  const dragPlane = useRef(new Plane());
  const intersection = useRef(new Vector3());
  const dragOffset = useRef(new Vector3());
  const nodeY = useRef(0);

  /**
   * Initialize a horizontal drag plane at the node's Y position.
   * Calculates XZ offset between click point and node position.
   */
  const startDrag = useCallback((nodePosition) => {
    nodeY.current = nodePosition[1];

    // Create horizontal plane (normal pointing up) at node's Y height
    dragPlane.current.setFromNormalAndCoplanarPoint(
      new Vector3(0, 1, 0),
      new Vector3(nodePosition[0], nodePosition[1], nodePosition[2])
    );

    // Find where mouse currently intersects the plane
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.ray.intersectPlane(dragPlane.current, intersection.current);

    if (hit) {
      // Store XZ offset only (node position minus click position)
      dragOffset.current.set(
        nodePosition[0] - intersection.current.x,
        0,
        nodePosition[2] - intersection.current.z
      );
    } else {
      dragOffset.current.set(0, 0, 0);
    }
  }, [camera, raycaster, pointer]);

  /**
   * Calculate the current intersection point with the horizontal drag plane.
   * Returns [x, y, z] array with fixed Y, or null if no intersection.
   */
  const updateDrag = useCallback(() => {
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.ray.intersectPlane(dragPlane.current, intersection.current);

    if (hit) {
      // Apply XZ offset, keep original Y
      return [
        intersection.current.x + dragOffset.current.x,
        nodeY.current,
        intersection.current.z + dragOffset.current.z,
      ];
    }
    return null;
  }, [camera, raycaster, pointer]);

  return { startDrag, updateDrag };
};

export default useDrag;
