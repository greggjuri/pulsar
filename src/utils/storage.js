const STORAGE_KEY = 'pulsar-diagram-autosave';

/**
 * Check if localStorage is available
 * @returns {boolean}
 */
export function isLocalStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Save graph to localStorage
 * @param {Object} graph - Serialized graph object
 * @returns {boolean} Success status
 */
export function saveToLocalStorage(graph) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(graph));
    return true;
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
    return false;
  }
}

/**
 * Load graph from localStorage
 * @returns {Object|null} Parsed graph or null if not found/invalid
 */
export function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
    return null;
  }
}

/**
 * Clear saved graph from localStorage
 * @returns {boolean} Success status
 */
export function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.warn('Failed to clear localStorage:', e);
    return false;
  }
}
