# INITIAL: 10 - Delete Node

> **File:** `initial-10-delete-node.md`  
> **Generates:** `prp-10-delete-node.md`

## Summary

Implement the ability to delete nodes from the diagram. This is the first Phase 4 (Editor) feature and establishes the pattern for destructive operations that modify the graph structure.

Users can delete a selected node by pressing the **Delete** or **Backspace** key. When a node is deleted, all connected edges are automatically removed as well. The operation is confirmed by visual feedback, not a modal dialog (MVP keeps it simple and fast).

## Requirements

### Functional Requirements

**1. Keyboard Shortcut**

- **Delete** or **Backspace** key deletes the currently selected node
- Only works when a node is selected (`selectedNodeId !== null`)
- Pressing Delete with no selection does nothing (no error, no feedback)
- Respects existing input focus check (already in App.jsx)

**2. Store Action**

Add a `deleteNode(id)` action to the graphStore:

```javascript
deleteNode: (id) => set((state) => ({
  // Remove the node
  nodes: state.nodes.filter(n => n.id !== id),
  // Remove any edges connected to this node
  edges: state.edges.filter(e => e.source !== id && e.target !== id),
  // Clear selection since the selected node no longer exists
  selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
})),
```

**3. HUD Integration**

Update the ControlsPanel to show a conditional "selected" section when a node is selected. Currently, the panel shows:
- Drag to rotate
- Scroll to zoom
- Click node to select
- Drag selected to move

When a node is selected, add below the current hints:
```
──────────────────
SELECTED
DEL to delete
ESC to deselect
```

**4. Auto-Save Trigger**

The existing `useAutoSave` hook already subscribes to nodes/edges changes. Deleting a node will automatically trigger a save to localStorage — no additional work needed.

**5. Edge Case: Deleting All Nodes**

If the user deletes all nodes, the diagram should be empty but functional:
- Camera fit/reset still works (shows default view via `camera.js` fallback)
- Stats panel shows "0 nodes · 0 edges"
- User can import a new diagram or add nodes (Phase 4 future feature)

### Non-Functional Requirements

- Action should be instantaneous (no animation on delete for MVP)
- Keyboard listener should be properly cleaned up on unmount
- Delete action should be idempotent (calling with non-existent ID does nothing)

## Technical Approach

### Keyboard Event Handling

Extend the existing `handleKeyDown` in `App.jsx` (which already handles Escape, F, R/Home):

```javascript
// Current App.jsx structure
useEffect(() => {
  const handleKeyDown = (e) => {
    // Ignore if typing in an input field (ALREADY EXISTS)
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    if (e.key === 'Escape') {
      clearSelection();
    } else if (e.key === 'f' || e.key === 'F') {
      triggerFit();
    } else if (e.key === 'r' || e.key === 'R' || e.key === 'Home') {
      triggerReset();
    }
    // ADD: Delete handling
    else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
      e.preventDefault(); // Prevent browser back on Backspace
      deleteNode(selectedNodeId);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [clearSelection, triggerFit, triggerReset, selectedNodeId, deleteNode]);
```

**Note:** The input focus check already exists — we just need to add `selectedNodeId` and `deleteNode` to the hook.

### Backspace Handling

Important: Backspace can trigger browser "back" navigation. We call `e.preventDefault()` to stop this, but only when a node is selected (so Backspace still works in hypothetical future text inputs).

## Component Changes

| File | Change |
|------|--------|
| `src/stores/graphStore.js` | Add `deleteNode(id)` action |
| `src/App.jsx` | Add Delete/Backspace to existing keyboard handler |
| `src/components/hud/ControlsPanel.jsx` | Add conditional "SELECTED" section with delete hint |

## Props / API Changes

**graphStore** — Add action:
- `deleteNode: (id: string) => void` — Removes node and connected edges

**ControlsPanel** — Add:
- Subscribe to `selectedNodeId` from store
- Conditionally render selected-node hints

## Dependencies

No new packages required.

## Acceptance Criteria

- [ ] Pressing Delete key with node selected removes the node
- [ ] Pressing Backspace key with node selected removes the node
- [ ] All edges connected to deleted node are also removed
- [ ] Selection is cleared after deletion
- [ ] NodeInfoPanel disappears after deletion
- [ ] Pressing Delete with no selection does nothing
- [ ] Stats panel updates to reflect new node/edge counts
- [ ] Diagram auto-saves after deletion (via existing useAutoSave)
- [ ] ControlsPanel shows "SELECTED" section with DEL/ESC hints when node selected
- [ ] Backspace doesn't navigate browser back
- [ ] Deleting all nodes leaves empty but functional diagram
- [ ] Camera fit/reset still work with 0 nodes

## Visual Reference

**ControlsPanel when NO node selected (current):**
```
┌─────────────────────────────┐
│ CONTROLS                    │
│ Drag to rotate              │
│ Scroll to zoom              │
│ Click node to select        │
│ Drag selected to move       │
│ ┌─────────┐ ┌─────────┐     │
│ │ ⊞ Fit   │ │ ↺ Reset │     │
│ └─────────┘ └─────────┘     │
└─────────────────────────────┘
```

**ControlsPanel when node IS selected (new):**
```
┌─────────────────────────────┐
│ CONTROLS                    │
│ Drag to rotate              │
│ Scroll to zoom              │
│ Click node to select        │
│ Drag selected to move       │
│                             │
│ SELECTED                    │
│ DEL to delete               │
│ ESC to deselect             │
│ ┌─────────┐ ┌─────────┐     │
│ │ ⊞ Fit   │ │ ↺ Reset │     │
│ └─────────┘ └─────────┘     │
└─────────────────────────────┘
```

## Out of Scope

- Undo/redo (future enhancement)
- Confirmation dialog before delete
- Delete animation (node fades out, etc.)
- Multi-select and bulk delete
- Delete button in NodeInfoPanel (keyboard only for MVP)
- Delete via context menu (right-click)

## Architecture Notes

This is a simple, additive change that doesn't introduce new patterns. It extends the existing graphStore with a new action and adds a keyboard shortcut to the existing listener.

The cascading edge delete (removing edges when their source or target is deleted) is a common pattern in graph data structures. We handle it in a single atomic state update to avoid intermediate invalid states.

---

**Ready for handoff to Claude Code** — Once you approve this spec, take it to Claude Code with `/generate-prp` to create the implementation plan.
