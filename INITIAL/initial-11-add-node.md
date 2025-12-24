# INITIAL: 11 - Add Node

> **File:** `initial-11-add-node.md`  
> **Generates:** `prp-11-add-node.md`

## Summary

Implement the ability to add new nodes to the diagram via a button click. New nodes are created with default properties and placed at a smart position that avoids overlapping existing nodes. The new node is automatically selected after creation.

This is a simple MVP approach — a full node palette with drag-and-drop, node type selection, and visual previews is planned for **Phase 5 (Polish)**.

## Requirements

### Functional Requirements

**1. Add Node Button**

Add a `+ NODE` button to the FileControlsPanel, alongside the existing NEW/EXPORT/IMPORT buttons:

```
+ NEW | + NODE | ↓ EXPORT | ↑ IMPORT
```

**2. Store Action**

Add an `addNode()` action to the graphStore:

```javascript
addNode: () => set((state) => {
  const newNode = {
    id: `node-${Date.now()}`,
    type: 'service',
    label: 'New Node',
    position: calculateNewNodePosition(state.nodes),
    color: '#00ffff', // Cyan - matches sci-fi theme
  };
  return {
    nodes: [...state.nodes, newNode],
    selectedNodeId: newNode.id, // Auto-select the new node
  };
}),
```

**3. Smart Positioning**

New nodes should be placed intelligently to avoid overlap:

1. **If no nodes exist**: Place at origin `[0, 0, 0]`
2. **If nodes exist**: Find an open position using a simple algorithm:
   - Start at `[0, 0, 0]`
   - If occupied (within `MIN_NODE_DISTANCE`), try positions in a spiral/grid pattern
   - Use the existing collision utility to check positions

**Simplified approach for MVP:**
```javascript
function calculateNewNodePosition(nodes) {
  if (nodes.length === 0) return [0, 0, 0];
  
  // Find bounding box of existing nodes
  const xs = nodes.map(n => n.position[0]);
  const zs = nodes.map(n => n.position[2]);
  const maxX = Math.max(...xs);
  
  // Place new node to the right of existing nodes
  return [maxX + 3, 0, 0]; // 3 units spacing (> MIN_NODE_DISTANCE of 2)
}
```

This keeps nodes in a roughly horizontal line, which works well for architecture diagrams.

**4. Auto-Select New Node**

After adding a node:
- The new node is automatically selected (`selectedNodeId = newNode.id`)
- NodeInfoPanel appears showing the new node's details
- User can immediately drag to reposition or press DEL to remove

**5. Auto-Save**

The existing `useAutoSave` hook will automatically save after a node is added — no additional work needed.

### Non-Functional Requirements

- Node ID must be unique (timestamp-based is sufficient for MVP)
- Adding many nodes in quick succession should work without conflicts
- New node should be visible in current camera view (consider triggering fit after add)

## Technical Approach

### Position Calculation Utility

Create a small utility function (can live in `graphStore.js` or a separate file):

```javascript
// src/utils/nodePosition.js (optional) or inline in graphStore

import { MIN_NODE_DISTANCE } from './collision';

/**
 * Calculate position for a new node, avoiding existing nodes
 */
export function calculateNewNodePosition(nodes) {
  if (nodes.length === 0) {
    return [0, 0, 0];
  }

  // Strategy: place to the right of the rightmost node
  const maxX = Math.max(...nodes.map(n => n.position[0]));
  const avgZ = nodes.reduce((sum, n) => sum + n.position[2], 0) / nodes.length;
  
  return [maxX + MIN_NODE_DISTANCE + 1, 0, Math.round(avgZ)];
}
```

### Store Integration

The `addNode` action is self-contained — it generates the node and updates state atomically.

### Camera Fit (Optional Enhancement)

After adding a node, optionally trigger `triggerFit()` to ensure the new node is visible. This is a nice UX touch but not strictly required for MVP (user can press F to fit manually).

## Component Changes

| File | Change |
|------|--------|
| `src/stores/graphStore.js` | Add `addNode()` action with position calculation |
| `src/components/hud/FileControlsPanel.jsx` | Add "+ NODE" button |

## Props / API Changes

**graphStore** — Add action:
- `addNode: () => void` — Creates a new node with default properties at a smart position

## Dependencies

No new packages required.

## Acceptance Criteria

- [ ] "+ NODE" button appears in FileControlsPanel
- [ ] Clicking button creates a new node
- [ ] New node has unique ID, type 'service', label 'New Node', cyan color
- [ ] New node is positioned to avoid overlapping existing nodes
- [ ] New node is automatically selected after creation
- [ ] NodeInfoPanel shows the new node's details
- [ ] Stats panel updates to reflect new node count
- [ ] Diagram auto-saves after adding node
- [ ] Adding node to empty diagram places it at origin
- [ ] Can add multiple nodes in quick succession without ID conflicts

## Visual Reference

**FileControlsPanel with Add Node button:**
```
┌─────────────────────────────────────────────────────────────┐
│  + NEW  |  + NODE  |  ↓ EXPORT  |  ↑ IMPORT                │
└─────────────────────────────────────────────────────────────┘
```

**New node appearance:**
- Same visual style as existing nodes (icosahedron core, glow, rotating rings)
- Cyan color (#00ffff) by default
- Label: "New Node"
- Immediately shows selection highlight (since auto-selected)

## Out of Scope (Deferred to Phase 5: Polish)

These features would make a great addition but are not needed for MVP:

- **Node Type Palette**: Visual picker showing different AWS service types with icons
- **Drag from Palette**: Drag a node type onto the canvas to place it precisely
- **Click-to-Place Mode**: Toggle mode where clicking canvas adds a node at that position
- **Node Templates**: Pre-configured nodes with service-specific colors and labels
- **Undo/Redo**: Ability to undo accidental node additions
- **Custom Labels on Create**: Prompt for node label before creating
- **Keyboard Shortcut**: e.g., `N` to add node (consider conflicts with typing)

## Architecture Notes

This feature follows the established patterns:
- Store action for state mutation
- HUD button triggers action
- Auto-save handles persistence
- Selection system shows feedback

The position calculation is intentionally simple — we prioritize getting nodes on screen quickly over perfect placement. Users can drag to reposition immediately.

## Future Considerations

When implementing the full node palette in Phase 5, consider:
- Store the node type definitions in a separate config file
- Include AWS service icons (SVG or sprites)
- Support custom colors per service type
- Allow setting label during creation
- Consider a floating palette vs sidebar vs modal approach

---

**Ready for handoff to Claude Code** — Once you approve this spec, take it to Claude Code with `/generate-prp` to create the implementation plan.
