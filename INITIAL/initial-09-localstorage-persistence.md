# INITIAL: 09 - localStorage Persistence

> **File:** `initial-09-localstorage-persistence.md`  
> **Generates:** `prp-09-localstorage-persistence.md`

## Summary

Implement automatic localStorage persistence for Pulsar diagrams. The current diagram state is saved to browser storage on every change and automatically restored when the user returns. This provides a seamless "pick up where you left off" experience without requiring manual save actions.

This completes Phase 3 (Data Management) by adding the final persistence layer before cloud sync.

## Requirements

### Functional Requirements

**1. Auto-Save to localStorage**

- Save the current graph state to localStorage whenever it changes:
  - Node added/removed/moved
  - Edge added/removed
  - Diagram name changed
- Use debouncing to avoid excessive writes (save at most every 500ms)
- Storage key: `pulsar-diagram-autosave`
- Store the same Graph schema used for JSON export (from INITIAL-08)

**2. Auto-Load on Startup**

- When the app loads, check for saved diagram in localStorage
- If found and valid:
  - Load the saved graph into the store
  - Show a subtle toast notification: "Restored previous diagram"
- If not found or invalid:
  - Load the default test data (current behavior)
  - No notification needed

**3. New Diagram Action**

- Add "New" button to FileControlsPanel (alongside Export/Import)
- Clicking "New" should:
  - Prompt for confirmation if current diagram has changes: "Start a new diagram? Current work will be cleared."
  - Clear localStorage autosave
  - Reset to empty diagram (no nodes, no edges)
  - Set diagramName to "Untitled Diagram"
  - Reset camera to default position

**4. Clear Storage on Export (Optional)**

- After successful export, optionally mark the diagram as "saved" 
- This is informational only for MVP — no unsaved changes indicator yet

**5. Storage Quota Handling**

- Catch localStorage quota errors gracefully
- If storage fails, log warning but don't interrupt user
- Consider showing a one-time warning if storage consistently fails

### Non-Functional Requirements

- Auto-save should not cause frame drops (debounce + async-like behavior)
- Storage operations should be fault-tolerant (corrupted data doesn't crash app)
- Works in private/incognito mode (graceful degradation if localStorage unavailable)

## Technical Approach

### Storage Utilities

Create `src/utils/storage.js`:

```javascript
const STORAGE_KEY = 'pulsar-diagram-autosave';

export function saveToLocalStorage(graph) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(graph));
    return true;
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
    return false;
  }
}

export function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
    return null;
  }
}

export function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.warn('Failed to clear localStorage:', e);
    return false;
  }
}

export function isLocalStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}
```

### Zustand Middleware Approach

Use Zustand's `subscribe` to watch for changes and trigger saves:

```javascript
// In App.jsx or a dedicated hook
import { useEffect } from 'react';
import { useGraphStore } from './stores/graphStore';
import { saveToLocalStorage } from './utils/storage';
import { serializeGraph } from './utils/graphSchema';
import { useDebouncedCallback } from 'use-debounce'; // or custom implementation

function useAutoSave() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const diagramName = useGraphStore((s) => s.diagramName);

  const debouncedSave = useDebouncedCallback(() => {
    const graph = serializeGraph(nodes, edges, diagramName);
    saveToLocalStorage(graph);
  }, 500);

  useEffect(() => {
    debouncedSave();
  }, [nodes, edges, diagramName, debouncedSave]);
}
```

**Alternative: Custom debounce (no new dependency)**

```javascript
function useAutoSave() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const diagramName = useGraphStore((s) => s.diagramName);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      const graph = serializeGraph(nodes, edges, diagramName);
      saveToLocalStorage(graph);
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nodes, edges, diagramName]);
}
```

### Initial Load

Modify store initialization or App.jsx:

```javascript
// Option A: In graphStore.js initialization
import { loadFromLocalStorage } from '../utils/storage';
import { validateGraph } from '../utils/graphSchema';
import { testNodes, testEdges } from '../data/testData';

function getInitialState() {
  const saved = loadFromLocalStorage();
  if (saved) {
    const { valid } = validateGraph(saved);
    if (valid) {
      return {
        nodes: saved.nodes,
        edges: saved.edges,
        diagramName: saved.name || 'Untitled Diagram',
        diagramId: saved.id || null,
      };
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

// Option B: In App.jsx useEffect (if we want to show "restored" toast)
```

### Toast Notification (Simple)

For MVP, use a simple CSS-animated toast:

```javascript
// src/components/hud/Toast.jsx
export function Toast({ message, visible, onClose }) {
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 
                    bg-black/80 border border-cyan-500/50 
                    px-4 py-2 rounded font-mono text-sm text-cyan-400
                    animate-fade-in-up">
      {message}
    </div>
  );
}
```

Or even simpler: just log to console for MVP and skip the toast.

### New Diagram Flow

```javascript
// In FileControlsPanel.jsx
const handleNew = () => {
  const confirmed = window.confirm(
    'Start a new diagram? Current work will be cleared.'
  );
  if (confirmed) {
    clearLocalStorage();
    // Reset store to empty state
    loadGraph({
      nodes: [],
      edges: [],
      name: 'Untitled Diagram',
      id: null,
    });
    triggerReset(); // Reset camera
  }
};
```

## Component Structure

```
src/
├── utils/
│   ├── storage.js          # NEW: localStorage helpers
│   ├── graphSchema.js      # (existing)
│   ├── fileExport.js       # (existing)
│   └── fileImport.js       # (existing)
├── hooks/
│   └── useAutoSave.js      # NEW: auto-save hook
├── stores/
│   └── graphStore.js       # MODIFY: initial state from localStorage
└── components/
    └── hud/
        ├── FileControlsPanel.jsx  # MODIFY: add New button
        └── Toast.jsx              # NEW: simple notification (optional)
```

## Props / API Changes

**graphStore** — Modifications:
- Initial state now checks localStorage first
- No new actions needed (uses existing `loadGraph`)

**FileControlsPanel** — Add:
- "New" button with confirmation dialog

**useAutoSave** (new hook):
- No props, subscribes to store and saves on changes

## Dependencies

**No new packages required.**

Option: Could add `use-debounce` for cleaner debounce, but custom implementation is fine.

## Acceptance Criteria

- [ ] `storage.js` utilities created with save/load/clear/isAvailable functions
- [ ] `useAutoSave` hook saves graph to localStorage on changes (debounced 500ms)
- [ ] On app load, saved diagram is restored from localStorage if valid
- [ ] Invalid/corrupted localStorage data doesn't crash app (falls back to test data)
- [ ] "New" button added to FileControlsPanel
- [ ] "New" shows confirmation dialog before clearing
- [ ] "New" clears localStorage, resets to empty diagram, resets camera
- [ ] Auto-save continues working after import (imported diagram gets auto-saved)
- [ ] Auto-save continues working after "New" (empty diagram gets auto-saved)
- [ ] Works in incognito mode (graceful degradation)
- [ ] No frame drops during auto-save (debouncing works)

## Visual Reference

Updated FileControlsPanel:

```jsx
<div className="absolute top-16 left-4 bg-black/60 border border-cyan-500/30 rounded px-3 py-2 font-mono text-xs">
  <div className="flex items-center gap-2">
    <button className="text-cyan-400 hover:text-cyan-300" title="New diagram">
      + NEW
    </button>
    <span className="text-cyan-500/30">|</span>
    <button className="text-cyan-400 hover:text-cyan-300" title="Export">
      ↓ EXPORT
    </button>
    <span className="text-cyan-500/30">|</span>
    <button className="text-cyan-400 hover:text-cyan-300" title="Import">
      ↑ IMPORT
    </button>
  </div>
</div>
```

## Out of Scope

- Multiple saved diagrams (single autosave slot for MVP)
- "Unsaved changes" indicator
- Cloud sync (Phase 6)
- Export to localStorage (user must use Export button for file)
- Undo/redo history persistence

## Testing Strategy

1. **Auto-save**: Make changes, refresh page, verify state restored
2. **Drag node**: Drag a node, refresh, verify new position persisted
3. **Import then refresh**: Import a file, refresh, verify imported state persisted
4. **New then refresh**: Click New, refresh, verify empty diagram
5. **Corrupted data**: Manually corrupt localStorage, refresh, verify falls back gracefully
6. **Incognito**: Test in private browsing, verify no errors (storage may not persist)

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | Client-side only | $0.00 |

**Free Tier Eligible:** Yes (no AWS services)

---

**Ready for handoff to Claude Code** — Take this spec to Claude Code with `/generate-prp` to create the implementation plan.
