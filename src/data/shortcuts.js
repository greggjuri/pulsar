/**
 * Keyboard Shortcuts Configuration
 * Centralized list of all keyboard shortcuts for the help panel.
 */

export const SHORTCUTS = [
  {
    category: 'Navigation',
    shortcuts: [
      { keys: ['F'], description: 'Fit camera to view all nodes' },
      { keys: ['R', 'Home'], description: 'Reset camera position' },
      { keys: ['Scroll'], description: 'Zoom in/out' },
      { keys: ['Drag'], description: 'Rotate camera' },
    ],
  },
  {
    category: 'Selection',
    shortcuts: [
      { keys: ['Click'], description: 'Select node or edge' },
      { keys: ['ESC'], description: 'Deselect / Cancel action' },
    ],
  },
  {
    category: 'Editing',
    shortcuts: [
      { keys: ['DEL'], description: 'Delete selected item' },
      { keys: ['Right-click'], description: 'Open context menu' },
      { keys: ['Drag node'], description: 'Move selected node' },
    ],
  },
  {
    category: 'Display',
    shortcuts: [
      { keys: ['L'], description: 'Toggle node labels' },
      { keys: ['I'], description: 'Toggle node icons' },
    ],
  },
  {
    category: 'Help',
    shortcuts: [
      { keys: ['?'], description: 'Toggle this panel' },
    ],
  },
];
