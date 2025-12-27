import { create } from 'zustand';
import { diagramsApi } from '../utils/api';

export const useCloudStore = create((set, get) => ({
  // State
  diagrams: [], // List of diagram metadata
  isLoading: false,
  error: null,
  currentCloudId: null, // ID of currently loaded cloud diagram
  hasUnsavedChanges: false,

  // Actions
  setLoading: (loading) => set({ isLoading: loading, error: null }),
  setError: (error) => set({ error, isLoading: false }),
  setUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
  setCurrentCloudId: (id) => set({ currentCloudId: id, hasUnsavedChanges: false }),

  // Fetch diagram list
  fetchDiagrams: async () => {
    set({ isLoading: true, error: null });
    try {
      const diagrams = await diagramsApi.list();
      set({ diagrams, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Load diagram from cloud
  loadDiagram: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const diagram = await diagramsApi.get(id);
      set({ isLoading: false, currentCloudId: id, hasUnsavedChanges: false });
      return diagram;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // Save current diagram to cloud
  saveDiagram: async (diagram) => {
    const { currentCloudId } = get();
    set({ isLoading: true, error: null });

    try {
      let result;
      if (currentCloudId) {
        // Update existing
        result = await diagramsApi.update(currentCloudId, diagram);
      } else {
        // Create new
        result = await diagramsApi.create(diagram);
        set({ currentCloudId: result.id });
      }

      // Refresh list
      await get().fetchDiagrams();
      set({ isLoading: false, hasUnsavedChanges: false });
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // Delete diagram from cloud
  deleteDiagram: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await diagramsApi.delete(id);

      // If we deleted the current diagram, clear it
      if (get().currentCloudId === id) {
        set({ currentCloudId: null });
      }

      // Refresh list
      await get().fetchDiagrams();
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  // Clear cloud state (on logout)
  clear: () =>
    set({
      diagrams: [],
      isLoading: false,
      error: null,
      currentCloudId: null,
      hasUnsavedChanges: false,
    }),
}));
