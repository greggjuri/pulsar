import { create } from 'zustand';
import { testNodes, testEdges } from '../data/testData';
import { loadFromLocalStorage, loadDisplaySettings, saveDisplaySettings } from '../utils/storage';
import { validateGraph } from '../utils/graphSchema';
import { MIN_NODE_DISTANCE } from '../utils/collision';

/**
 * Calculate position for a new node, avoiding existing nodes
 */
function calculateNewNodePosition(nodes) {
  if (nodes.length === 0) {
    return [0, 0, 0];
  }

  // Place to the right of the rightmost node
  const maxX = Math.max(...nodes.map((n) => n.position[0]));
  return [maxX + MIN_NODE_DISTANCE + 1, 0, 0];
}

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
const displaySettings = loadDisplaySettings();

export const useGraphStore = create((set) => ({
  nodes: initialState.nodes,
  edges: initialState.edges,
  selectedNodeId: null,
  selectedEdgeId: null,
  connectingFromNodeId: null,
  draggingNodeId: null,

  // Display settings
  showLabels: displaySettings.showLabels,
  showIcons: displaySettings.showIcons,

  toggleLabels: () =>
    set((state) => {
      const newValue = !state.showLabels;
      saveDisplaySettings({ showLabels: newValue, showIcons: state.showIcons });
      return { showLabels: newValue };
    }),

  toggleIcons: () =>
    set((state) => {
      const newValue = !state.showIcons;
      saveDisplaySettings({ showLabels: state.showLabels, showIcons: newValue });
      return { showIcons: newValue };
    }),

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
      selectedEdgeId: null,
      connectingFromNodeId: null,
      draggingNodeId: null,
    }),

  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
  clearSelection: () => set({ selectedNodeId: null, selectedEdgeId: null, connectingFromNodeId: null }),

  // Delete node and connected edges
  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

  // Add new node
  addNode: () =>
    set((state) => {
      const newNode = {
        id: `node-${Date.now()}`,
        type: 'generic',
        label: 'New Node',
        position: calculateNewNodePosition(state.nodes),
        color: '#00ffff',
      };
      return {
        nodes: [...state.nodes, newNode],
        selectedNodeId: newNode.id,
        selectedEdgeId: null,
      };
    }),

  // Edge management
  deleteEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
      selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
    })),

  startConnecting: (nodeId) => set({ connectingFromNodeId: nodeId, selectedNodeId: null, selectedEdgeId: null }),
  cancelConnecting: () => set({ connectingFromNodeId: null }),

  addEdge: (source, target) =>
    set((state) => {
      // Cannot connect to self
      if (source === target) return state;

      // Check for duplicate edge (either direction)
      const exists = state.edges.some(
        (e) =>
          (e.source === source && e.target === target) ||
          (e.source === target && e.target === source)
      );
      if (exists) return state;

      const newEdge = {
        id: `edge-${Date.now()}`,
        source,
        target,
        animated: true,
        style: 'solid',
      };

      return {
        edges: [...state.edges, newEdge],
        connectingFromNodeId: null,
        selectedEdgeId: newEdge.id,
        selectedNodeId: null,
      };
    }),

  // Drag actions
  setDraggingNode: (id) => set({ draggingNodeId: id }),
  clearDraggingNode: () => set({ draggingNodeId: null }),

  updateNodePosition: (id, position) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === id ? { ...node, position } : node
    ),
  })),

  // Generic node update (for label, color, etc.)
  updateNode: (id, updates) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === id ? { ...node, ...updates } : node
    ),
  })),

  // Camera actions
  cameraAction: null, // 'fit' | 'reset' | null
  triggerFit: () => set({ cameraAction: 'fit' }),
  triggerReset: () => set({ cameraAction: 'reset' }),
  clearCameraAction: () => set({ cameraAction: null }),

  // UI state
  showShortcuts: false,
  setShowShortcuts: (show) => set({ showShortcuts: show }),
  toggleShortcuts: () => set((state) => ({ showShortcuts: !state.showShortcuts })),
}));
