import { useEffect, useRef } from 'react';
import { useGraphStore } from '../stores/graphStore';
import { useCloudStore } from '../stores/cloudStore';
import { useAuthStore } from '../stores/authStore';

export function useTrackChanges() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const diagramName = useGraphStore((s) => s.diagramName);
  const setUnsavedChanges = useCloudStore((s) => s.setUnsavedChanges);

  const isFirstRender = useRef(true);
  const lastSavedState = useRef(null);

  useEffect(() => {
    // Skip first render (initial load)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastSavedState.current = JSON.stringify({ nodes, edges, diagramName });
      return;
    }

    if (!isAuthenticated) return;

    const currentState = JSON.stringify({ nodes, edges, diagramName });
    if (currentState !== lastSavedState.current) {
      setUnsavedChanges(true);
    }
  }, [nodes, edges, diagramName, isAuthenticated, setUnsavedChanges]);

  // Reset tracking when cloud save happens
  useEffect(() => {
    const unsubscribe = useCloudStore.subscribe(
      (state) => state.hasUnsavedChanges,
      (hasUnsavedChanges) => {
        if (!hasUnsavedChanges) {
          const { nodes, edges, diagramName } = useGraphStore.getState();
          lastSavedState.current = JSON.stringify({ nodes, edges, diagramName });
        }
      }
    );
    return unsubscribe;
  }, []);
}
