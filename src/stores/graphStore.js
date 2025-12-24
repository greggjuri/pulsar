import { create } from 'zustand';
import { testNodes, testEdges } from '../data/testData';
import { loadFromLocalStorage } from '../utils/storage';
import { validateGraph } from '../utils/graphSchema';

/**
 * Get initial state from localStorage or fall back to test data
 */
function getInitialState() {
  const saved = loadFromLocalStorage();

  if (saved) {
    const { valid } = validateGraph(saved);
    if (valid) {
      console.log('Restored diagram from localStorage');
      return {
        nodes: saved.nodes,
        edges: saved.edges,
        diagramName: saved.name || 'Untitled Diagram',
        diagramId: saved.id || null,
      };
    } else {
      console.warn('Invalid saved diagram, using default');
    }
  }

  // Fallback to test data
  return {
    nodes: testNodes,
    edges: testEdges,
    diagramName: 'Untitled Diagram',
    diagramId: null,
  };
}

const initialState = getInitialState();

export const useGraphStore = create((set) => ({
  nodes: initialState.nodes,
  edges: initialState.edges,
  selectedNodeId: null,
  draggingNodeId: null,

  // Diagram metadata
  diagramName: initialState.diagramName,
  diagramId: initialState.diagramId,

  setDiagramName: (name) => set({ diagramName: name }),

  loadGraph: (graph) =>
    set({
      nodes: graph.nodes,
      edges: graph.edges,
      diagramName: graph.name || 'Imported Diagram',
      diagramId: graph.id || crypto.randomUUID(),
      selectedNodeId: null,
      draggingNodeId: null,
    }),

  selectNode: (id) => set({ selectedNodeId: id }),
  clearSelection: () => set({ selectedNodeId: null }),

  // Delete node and connected edges
  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

  // Drag actions
  setDraggingNode: (id) => set({ draggingNodeId: id }),
  clearDraggingNode: () => set({ draggingNodeId: null }),

  updateNodePosition: (id, position) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === id ? { ...node, position } : node
    ),
  })),

  // Camera actions
  cameraAction: null, // 'fit' | 'reset' | null
  triggerFit: () => set({ cameraAction: 'fit' }),
  triggerReset: () => set({ cameraAction: 'reset' }),
  clearCameraAction: () => set({ cameraAction: null }),
}));
