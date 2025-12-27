exports.validateDiagram = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  if (data.name && typeof data.name !== 'string') {
    return { valid: false, error: 'Name must be a string' };
  }

  if (data.name && data.name.length > 100) {
    return { valid: false, error: 'Name must be 100 characters or less' };
  }

  if (data.nodes && !Array.isArray(data.nodes)) {
    return { valid: false, error: 'Nodes must be an array' };
  }

  if (data.edges && !Array.isArray(data.edges)) {
    return { valid: false, error: 'Edges must be an array' };
  }

  return { valid: true };
};
