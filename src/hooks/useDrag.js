import { useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { Plane, Vector3 } from 'three';

/**
 * Hook for handling 3D drag operations on a plane perpendicular to the camera.
 * Returns functions to start drag and update drag position.
 */
const useDrag = () => {
  const { camera, raycaster, pointer } = useThree();

  const dragPlane = useRef(new Plane());
  const intersection = useRef(new Vector3());

  /**
   * Initialize the drag plane perpendicular to camera, passing through the node position.
   * Call this when drag starts.
   */
  const startDrag = useCallback((nodePosition) => {
    const planeNormal = new Vector3();
    camera.getWorldDirection(planeNormal);
    dragPlane.current.setFromNormalAndCoplanarPoint(
      planeNormal,
      new Vector3(nodePosition[0], nodePosition[1], nodePosition[2])
    );
  }, [camera]);

  /**
   * Calculate the current intersection point with the drag plane.
   * Call this during pointer move to get the new position.
   * Returns [x, y, z] array or null if no intersection.
   */
  const updateDrag = useCallback(() => {
    // Update raycaster from current pointer position
    raycaster.setFromCamera(pointer, camera);

    // Find intersection with drag plane
    const hit = raycaster.ray.intersectPlane(dragPlane.current, intersection.current);

    if (hit) {
      return [intersection.current.x, intersection.current.y, intersection.current.z];
    }
    return null;
  }, [camera, raycaster, pointer]);

  return { startDrag, updateDrag };
};

export default useDrag;
