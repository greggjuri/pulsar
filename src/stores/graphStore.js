import { create } from 'zustand';
import { testNodes, testEdges } from '../data/testData';

export const useGraphStore = create((set) => ({
  nodes: testNodes,
  edges: testEdges,
  selectedNodeId: null,

  selectNode: (id) => set({ selectedNodeId: id }),
  clearSelection: () => set({ selectedNodeId: null }),
}));
