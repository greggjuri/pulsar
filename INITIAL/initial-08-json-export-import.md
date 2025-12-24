# INITIAL: 08 - JSON Export/Import

> **File:** `initial-08-json-export-import.md`  
> **Generates:** `prp-08-json-export-import.md`

## Summary

Implement JSON export and import functionality for Pulsar diagrams. This enables users to save their work locally as JSON files and share diagrams with others. Export serializes the current graph state, while import validates and loads a JSON file into the store.

This is the first Phase 3 feature and establishes the serialization format that will be used for localStorage persistence and eventual cloud storage.

## Requirements

### Functional Requirements

**1. Export to JSON**

- Clicking an "Export" button downloads a JSON file to the user's device
- File format follows the `Graph` schema from PLANNING.md:

```typescript
interface Graph {
  id: string;           // UUID generated on export
  name: string;         // User-editable, defaults to "Untitled Diagram"
  nodes: Node[];
  edges: Edge[];
  metadata: {
    createdAt: string;  // ISO timestamp
    updatedAt: string;  // ISO timestamp
    version: string;    // "1.0.0" for now
    exportedFrom: string; // "pulsar-web"
  };
}
```

- Filename: `pulsar-diagram-{name}-{timestamp}.json` (e.g., `pulsar-diagram-untitled-2024-12-24.json`)
- All current node positions are captured (including any the user has dragged)

**2. Import from JSON**

- "Import" button opens a file picker dialog
- Accepts `.json` files only
- Validates the JSON structure before loading:
  - Must have `nodes` array (can be empty)
  - Must have `edges` array (can be empty)
  - Each node must have: `id`, `label`, `position` (array of 3 numbers)
  - Each edge must have: `id`, `source`, `target`
  - All edge `source` and `target` values must reference existing node IDs
- On successful import:
  - Replace current store state with imported data
  - Clear selection
  - Trigger camera "fit" to show all imported nodes
- On validation failure:
  - Show error toast/alert with specific validation error
  - Do not modify current graph

**3. Diagram Name Management**

- Add `diagramName` to the graphStore (default: "Untitled Diagram")
- Display current diagram name in HeaderPanel (optional subtitle under "PULSAR")
- Before export, optionally prompt for diagram name (or use modal/inline edit)
- For MVP: Just use a simple `prompt()` dialog before export if name is still "Untitled Diagram"

**4. HUD Integration**

Add export/import controls to the UI. Options:
- **Option A**: New `FileControlsPanel` in HUD (top-right area)
- **Option B**: Add buttons to existing `ControlsPanel`
- **Recommendation**: Option A — keeps file operations visually distinct

The panel should include:
- Export button (↓ or 📥 icon)
- Import button (↑ or 📤 icon)
- Display current diagram name (optional for MVP)

### Non-Functional Requirements

- Export/import should handle graphs up to 100 nodes without noticeable delay
- Imported files are validated entirely before any state changes (atomic operation)
- Export uses standard browser download mechanism (no external dependencies)
- Import uses standard browser file picker (no external dependencies)

## Technical Approach

### Graph Schema (Utilities)

Create `src/utils/graphSchema.js` with:

```javascript
// Schema version for future migrations
export const SCHEMA_VERSION = '1.0.0';

// Generate export-ready graph object
export function serializeGraph(nodes, edges, name = 'Untitled Diagram') {
  return {
    id: crypto.randomUUID(),
    name,
    nodes: nodes.map(node => ({
      id: node.id,
      type: node.type || 'service',
      label: node.label,
      position: [...node.position],
      color: node.color,
      metadata: node.metadata || {}
    })),
    edges: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.animated ?? true,
      style: edge.style || 'solid',
      label: edge.label
    })),
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: SCHEMA_VERSION,
      exportedFrom: 'pulsar-web'
    }
  };
}

// Validate imported graph structure
export function validateGraph(data) {
  const errors = [];
  
  // Check required arrays
  if (!Array.isArray(data.nodes)) {
    errors.push('Missing or invalid "nodes" array');
  }
  if (!Array.isArray(data.edges)) {
    errors.push('Missing or invalid "edges" array');
  }
  
  if (errors.length > 0) return { valid: false, errors };
  
  // Validate nodes
  const nodeIds = new Set();
  data.nodes.forEach((node, i) => {
    if (!node.id) errors.push(`Node ${i}: missing "id"`);
    if (!node.label) errors.push(`Node ${i}: missing "label"`);
    if (!Array.isArray(node.position) || node.position.length !== 3) {
      errors.push(`Node ${i}: "position" must be [x, y, z] array`);
    }
    if (node.id) nodeIds.add(node.id);
  });
  
  // Validate edges
  data.edges.forEach((edge, i) => {
    if (!edge.id) errors.push(`Edge ${i}: missing "id"`);
    if (!edge.source) errors.push(`Edge ${i}: missing "source"`);
    if (!edge.target) errors.push(`Edge ${i}: missing "target"`);
    if (edge.source && !nodeIds.has(edge.source)) {
      errors.push(`Edge ${i}: source "${edge.source}" not found in nodes`);
    }
    if (edge.target && !nodeIds.has(edge.target)) {
      errors.push(`Edge ${i}: target "${edge.target}" not found in nodes`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}
```

### Export Implementation

```javascript
// src/utils/fileExport.js
export function downloadAsJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

### Import Implementation

```javascript
// src/utils/fileImport.js
export function openFilePicker() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return reject(new Error('No file selected'));
      
      const reader = new FileReader();
      reader.onload = (e) => resolve(JSON.parse(e.target.result));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };
    input.click();
  });
}
```

### Store Updates

Extend `graphStore.js`:

```javascript
// Add to store
diagramName: 'Untitled Diagram',
diagramId: null,

setDiagramName: (name) => set({ diagramName: name }),

loadGraph: (graph) => set({
  nodes: graph.nodes,
  edges: graph.edges,
  diagramName: graph.name || 'Imported Diagram',
  diagramId: graph.id || crypto.randomUUID(),
  selectedNodeId: null,
  draggingNodeId: null,
}),
```

## Component Structure

```
src/
├── utils/
│   ├── graphSchema.js    # NEW: serialize, validate
│   ├── fileExport.js     # NEW: download helper
│   └── fileImport.js     # NEW: file picker helper
├── stores/
│   └── graphStore.js     # MODIFY: add diagramName, loadGraph
└── components/
    └── hud/
        ├── FileControlsPanel.jsx  # NEW: export/import buttons
        └── HudOverlay.jsx         # MODIFY: add FileControlsPanel
```

## Props / API Changes

**graphStore** — New state and actions:
- `diagramName: string` — Current diagram name
- `diagramId: string | null` — Current diagram ID (null for unsaved)
- `setDiagramName: (name) => void` — Update diagram name
- `loadGraph: (graph) => void` — Replace current graph with imported data

**FileControlsPanel** — New component:
- No props (reads/writes to store directly)
- Renders export and import buttons

## Dependencies

No new dependencies required. Uses browser APIs:
- `crypto.randomUUID()` — UUID generation (modern browsers)
- `Blob` + `URL.createObjectURL()` — File download
- `FileReader` — File import

## Acceptance Criteria

- [ ] `serializeGraph()` utility produces valid Graph JSON matching PLANNING.md schema
- [ ] `validateGraph()` correctly identifies invalid inputs and returns specific errors
- [ ] Export button downloads a properly formatted JSON file
- [ ] Exported JSON includes all current node positions (including dragged positions)
- [ ] Import button opens file picker limited to .json files
- [ ] Importing valid JSON replaces current graph and triggers camera fit
- [ ] Importing invalid JSON shows error message with validation details
- [ ] Importing JSON with edge referencing non-existent node shows clear error
- [ ] `diagramName` appears in store and is included in exports
- [ ] FileControlsPanel styled consistently with other HUD elements (sci-fi aesthetic)
- [ ] Export → Import roundtrip preserves all node/edge data
- [ ] Store selection is cleared after import

## Visual Reference

FileControlsPanel styling (matches existing panels):

```jsx
<div className="absolute top-4 right-4 bg-black/60 border border-cyan-500/30 rounded px-3 py-2 font-mono text-xs">
  <div className="flex items-center gap-2">
    <button 
      className="text-cyan-400 hover:text-cyan-300 transition-colors"
      title="Export diagram"
    >
      ↓ EXPORT
    </button>
    <span className="text-cyan-500/30">|</span>
    <button 
      className="text-cyan-400 hover:text-cyan-300 transition-colors"
      title="Import diagram"
    >
      ↑ IMPORT
    </button>
  </div>
</div>
```

## Out of Scope

- localStorage persistence (separate INITIAL-09)
- Cloud save/sync (Phase 6)
- Export to other formats (PNG, SVG — Phase 5)
- Undo/redo for import (future enhancement)
- Merge import (vs. replace) — future enhancement
- Schema migration (future, when schema changes)
- Auto-save (separate feature)

## Example Export Output

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "name": "My AWS Architecture",
  "nodes": [
    {
      "id": "api-gw",
      "type": "apigateway",
      "label": "API Gateway",
      "position": [-6, 0, 0],
      "color": "#ff9900",
      "metadata": {}
    },
    {
      "id": "lambda1",
      "type": "lambda",
      "label": "Lambda",
      "position": [-2, 0, 0],
      "color": "#ff9900",
      "metadata": {}
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "api-gw",
      "target": "lambda1",
      "animated": true,
      "style": "solid"
    }
  ],
  "metadata": {
    "createdAt": "2024-12-24T10:30:00.000Z",
    "updatedAt": "2024-12-24T10:30:00.000Z",
    "version": "1.0.0",
    "exportedFrom": "pulsar-web"
  }
}
```

## Testing Strategy

1. **Export verification**: Export, then manually inspect JSON for correct structure
2. **Roundtrip test**: Export → Drag nodes → Export again → Compare files (positions should differ)
3. **Import valid file**: Create JSON matching schema, import, verify all nodes/edges render
4. **Import invalid file**: Try importing malformed JSON, JSON with missing fields, JSON with bad edge references — should show errors
5. **Camera fit**: After import, all nodes should be visible (camera fits to new bounds)

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A     | Client-side only | $0.00 |

**Free Tier Eligible:** Yes (no AWS services used)

---

**Ready for handoff to Claude Code** — Take this spec to Claude Code with `/generate-prp` to create the implementation plan.
