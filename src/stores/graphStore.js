import { create } from 'zustand';
import { testNodes, testEdges } from '../data/testData';

export const useGraphStore = create((set) => ({
  nodes: testNodes,
  edges: testEdges,
  selectedNodeId: null,
  draggingNodeId: null,

  selectNode: (id) => set({ selectedNodeId: id }),
  clearSelection: () => set({ selectedNodeId: null }),

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
