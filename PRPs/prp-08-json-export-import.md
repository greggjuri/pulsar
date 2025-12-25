# PRP: 08 - JSON Export/Import

> Generated from: `INITIAL/initial-08-json-export-import.md`
> Generated on: 2025-12-24
> Confidence: 9/10

## Summary

Implement JSON export and import functionality for Pulsar diagrams. Export serializes the current graph state to a downloadable JSON file. Import validates and loads a JSON file, replacing the current graph. This establishes the serialization format for future localStorage and cloud persistence.

## Requirements Addressed

1. Export to JSON - download current diagram as `.json` file with proper schema
2. Import from JSON - file picker, validation, replace current graph
3. Diagram name management - track name in store, include in exports
4. HUD integration - Export/Import buttons in new FileControlsPanel
5. Validation - reject invalid JSON with specific error messages
6. Camera fit after import - show all imported nodes

## Technical Approach

### Architecture

- **Utility-based**: Separate serialization, validation, and file I/O into utilities
- **Store-driven**: Add `loadGraph` action for atomic graph replacement
- **Browser APIs**: Use native Blob/URL for export, FileReader for import
- **No dependencies**: All functionality uses built-in browser APIs

### Key Files

1. `src/utils/graphSchema.js` - Serialization and validation
2. `src/utils/fileExport.js` - Download helper
3. `src/utils/fileImport.js` - File picker helper
4. `src/stores/graphStore.js` - Add diagram state and loadGraph
5. `src/components/hud/FileControlsPanel.jsx` - Export/Import buttons

## Implementation Steps

### Step 1: Create Graph Schema Utilities
**Files:** `src/utils/graphSchema.js` (NEW)

**Changes:**
- [ ] Export `SCHEMA_VERSION = '1.0.0'`
- [ ] Create `serializeGraph(nodes, edges, name)` - returns Graph object with UUID, metadata
- [ ] Create `validateGraph(data)` - returns `{ valid, errors }` with specific validation errors
- [ ] Validate: nodes array, edges array, required node fields (id, label, position)
- [ ] Validate: required edge fields (id, source, target), edge references exist

**Validation:**
- [ ] serializeGraph produces valid JSON structure
- [ ] validateGraph catches missing nodes/edges arrays
- [ ] validateGraph catches invalid edge references

### Step 2: Create File Export Utility
**Files:** `src/utils/fileExport.js` (NEW)

**Changes:**
- [ ] Create `downloadAsJson(data, filename)` - uses Blob + createObjectURL
- [ ] Create `generateFilename(name)` - returns `pulsar-diagram-{name}-{date}.json`

**Validation:**
- [ ] Calling downloadAsJson triggers browser download

### Step 3: Create File Import Utility
**Files:** `src/utils/fileImport.js` (NEW)

**Changes:**
- [ ] Create `openFilePicker()` - returns Promise with parsed JSON
- [ ] Limit file picker to `.json` files
- [ ] Handle file read errors gracefully

**Validation:**
- [ ] File picker opens and limits to JSON
- [ ] Returns parsed JSON data on success

### Step 4: Extend graphStore with Diagram State
**Files:** `src/stores/graphStore.js` (MODIFY)

**Changes:**
- [ ] Add `diagramName: 'Untitled Diagram'` state
- [ ] Add `diagramId: null` state
- [ ] Add `setDiagramName: (name) => void` action
- [ ] Add `loadGraph: (graph) => void` action - replaces nodes, edges, clears selection

**Validation:**
- [ ] loadGraph replaces all graph data
- [ ] Selection is cleared after loadGraph

### Step 5: Create FileControlsPanel Component
**Files:** `src/components/hud/FileControlsPanel.jsx` (NEW)

**Changes:**
- [ ] Create panel with Export and Import buttons
- [ ] Style matching HUD aesthetic (bg-black/60, border-cyan-500/30)
- [ ] Position top-left below header (avoid ControlsPanel overlap)
- [ ] Export button: serialize graph, prompt for name if untitled, download
- [ ] Import button: open picker, validate, show errors or load graph, trigger fit

**Validation:**
- [ ] Panel renders without overlap
- [ ] Buttons have correct styling and hover states

### Step 6: Add FileControlsPanel to HudOverlay
**Files:** `src/components/hud/HudOverlay.jsx` (MODIFY)

**Changes:**
- [ ] Import FileControlsPanel
- [ ] Add FileControlsPanel to the overlay

**Validation:**
- [ ] FileControlsPanel visible in HUD

### Step 7: Integrate Export Flow
**Files:** `src/components/hud/FileControlsPanel.jsx` (MODIFY)

**Changes:**
- [ ] On export click: get nodes/edges from store
- [ ] If diagramName is "Untitled Diagram", prompt for name
- [ ] Serialize with serializeGraph
- [ ] Download with downloadAsJson

**Validation:**
- [ ] Export downloads JSON file with correct name format
- [ ] Exported JSON includes all current node positions

### Step 8: Integrate Import Flow
**Files:** `src/components/hud/FileControlsPanel.jsx` (MODIFY)

**Changes:**
- [ ] On import click: open file picker
- [ ] Parse JSON and validate with validateGraph
- [ ] On error: show alert with validation errors
- [ ] On success: call loadGraph, then triggerFit

**Validation:**
- [ ] Valid JSON imports correctly
- [ ] Invalid JSON shows error alert
- [ ] Camera fits to imported nodes

### Step 9: Test Roundtrip and Edge Cases
**Files:** N/A (manual testing)

**Changes:**
- [ ] Test export → import roundtrip (positions preserved)
- [ ] Test import with missing nodes array (should error)
- [ ] Test import with bad edge reference (should error)
- [ ] Test with 0 nodes (empty graph)

**Validation:**
- [ ] All roundtrip data preserved
- [ ] Errors display correctly

### Step 10: Update Documentation
**Files:** `docs/TASK.md` (MODIFY)

**Changes:**
- [ ] Mark PRP-08 as complete
- [ ] Add session notes
- [ ] Commit and push

**Validation:**
- [ ] Documentation updated, changes committed

## Dependencies

**No new packages required.**

Uses browser APIs:
- `crypto.randomUUID()` - UUID generation
- `Blob` + `URL.createObjectURL()` - File download
- `FileReader` - File import
- `JSON.parse()` / `JSON.stringify()` - Serialization

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | Client-side only | $0.00 |

**Free Tier Eligible:** Yes (no AWS services)

## Testing Strategy

- [ ] Export produces valid JSON matching schema
- [ ] Exported positions match current (including dragged) positions
- [ ] Import with valid JSON replaces graph
- [ ] Import triggers camera fit
- [ ] Import with invalid JSON shows error
- [ ] Import with bad edge references shows specific error
- [ ] Roundtrip export → import preserves all data

## Rollback Plan

If issues arise:
1. Remove FileControlsPanel from HudOverlay
2. Remove diagram state from graphStore
3. Delete new files: graphSchema.js, fileExport.js, fileImport.js, FileControlsPanel.jsx

## Open Questions

None - the INITIAL spec is comprehensive with code examples.

## File Position Note

FileControlsPanel will be positioned in top-left area below HeaderPanel to avoid overlap with ControlsPanel (which is top-right). Position: `absolute top-16 left-4`.
