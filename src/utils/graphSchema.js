// Schema version for future migrations
export const SCHEMA_VERSION = '1.0.0';

/**
 * Generate export-ready graph object
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge objects
 * @param {string} name - Diagram name
 * @returns {Object} Serialized graph object
 */
export function serializeGraph(nodes, edges, name = 'Untitled Diagram') {
  return {
    id: crypto.randomUUID(),
    name,
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type || 'service',
      label: node.label,
      position: [...node.position],
      color: node.color,
      metadata: node.metadata || {},
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.animated ?? true,
      style: edge.style || 'solid',
      label: edge.label,
    })),
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: SCHEMA_VERSION,
      exportedFrom: 'pulsar-web',
    },
  };
}

/**
 * Validate imported graph structure
 * @param {Object} data - Parsed JSON data
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateGraph(data) {
  const errors = [];

  // Check required arrays
  if (!Array.isArray(data.nodes)) {
    errors.push('Missing or invalid "nodes" array');
  }
  if (!Array.isArray(data.edges)) {
    errors.push('Missing or invalid "edges" array');
  }

  if (errors.length > 0) return { valid: false, errors };

  // Validate nodes
  const nodeIds = new Set();
  data.nodes.forEach((node, i) => {
    if (!node.id) errors.push(`Node ${i}: missing "id"`);
    if (!node.label) errors.push(`Node ${i}: missing "label"`);
    if (!Array.isArray(node.position) || node.position.length !== 3) {
      errors.push(`Node ${i}: "position" must be [x, y, z] array`);
    }
    if (node.id) nodeIds.add(node.id);
  });

  // Validate edges
  data.edges.forEach((edge, i) => {
    if (!edge.id) errors.push(`Edge ${i}: missing "id"`);
    if (!edge.source) errors.push(`Edge ${i}: missing "source"`);
    if (!edge.target) errors.push(`Edge ${i}: missing "target"`);
    if (edge.source && !nodeIds.has(edge.source)) {
      errors.push(`Edge ${i}: source "${edge.source}" not found in nodes`);
    }
    if (edge.target && !nodeIds.has(edge.target)) {
      errors.push(`Edge ${i}: target "${edge.target}" not found in nodes`);
    }
  });

  return { valid: errors.length === 0, errors };
}
