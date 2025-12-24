/**
 * Download data as a JSON file
 * @param {Object} data - Data to serialize as JSON
 * @param {string} filename - Filename for download
 */
export function downloadAsJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate a filename for the exported diagram
 * @param {string} name - Diagram name
 * @returns {string} Formatted filename
 */
export function generateFilename(name) {
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const date = new Date().toISOString().split('T')[0];
  return `pulsar-diagram-${sanitized || 'untitled'}-${date}.json`;
}
