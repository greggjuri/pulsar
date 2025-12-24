/**
 * Minimum distance between node centers (in world units).
 * Nodes closer than this are considered colliding.
 */
export const MIN_NODE_DISTANCE = 2.0;

/**
 * Calculate 3D distance between two positions.
 */
const distance3D = (pos1, pos2) => {
  const dx = pos1[0] - pos2[0];
  const dy = pos1[1] - pos2[1];
  const dz = pos1[2] - pos2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Check if a node at newPosition would collide with any other node.
 * @param {string} draggedId - ID of the node being dragged (excluded from check)
 * @param {[number, number, number]} newPosition - Proposed new position
 * @param {Array} nodes - Array of all nodes with id and position properties
 * @returns {boolean} True if collision detected, false otherwise
 */
export const checkCollision = (draggedId, newPosition, nodes) => {
  for (const node of nodes) {
    if (node.id === draggedId) continue;

    const dist = distance3D(newPosition, node.position);
    if (dist < MIN_NODE_DISTANCE) {
      return true;
    }
  }
  return false;
};
