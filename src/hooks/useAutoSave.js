import { useEffect, useRef } from 'react';
import { useGraphStore } from '../stores/graphStore';
import { serializeGraph } from '../utils/graphSchema';
import { saveToLocalStorage, isLocalStorageAvailable } from '../utils/storage';

const DEBOUNCE_MS = 500;

/**
 * Hook that auto-saves the graph to localStorage on changes
 * Debounced to avoid excessive writes
 */
export function useAutoSave() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const diagramName = useGraphStore((s) => s.diagramName);
  const diagramId = useGraphStore((s) => s.diagramId);

  const timeoutRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip auto-save on first render (initial load)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Skip if localStorage not available
    if (!isLocalStorageAvailable()) {
      return;
    }

    // Clear any pending save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Schedule debounced save
    timeoutRef.current = setTimeout(() => {
      const graph = serializeGraph(nodes, edges, diagramName);
      // Preserve the existing diagram ID if we have one
      if (diagramId) {
        graph.id = diagramId;
      }
      saveToLocalStorage(graph);
    }, DEBOUNCE_MS);

    // Cleanup on unmount or before next effect
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nodes, edges, diagramName, diagramId]);
}
