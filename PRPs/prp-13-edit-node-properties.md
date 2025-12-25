# PRP: 13 - Edit Node Properties

> Generated from: `INITIAL/initial-13-edit-node-properties.md`
> Generated on: 2024-12-24
> Confidence: 9/10

## Summary

Enable editing of node properties (label and color) through the NodeInfoPanel. Users can click the label to edit it inline, and click a color swatch to select from a preset palette. This completes Phase 4 (Editor) by giving users full control over their diagram's appearance.

## Requirements Addressed

1. **Editable Label** - Click label to edit, Enter/outside saves, Escape cancels
2. **Color Picker** - Click color swatch, select from 6 preset colors
3. **Generic updateNode Action** - Supports updating any node property
4. **Auto-Save** - Existing useAutoSave hook handles persistence automatically

## Technical Approach

### Architecture

- **Store extension**: Add generic `updateNode(id, updates)` action
- **NodeInfoPanel modifications**: Add inline label editing and color picker
- **No new components**: Keep functionality within NodeInfoPanel for simplicity

### Key Changes

1. `src/stores/graphStore.js` - Add `updateNode` action
2. `src/components/hud/NodeInfoPanel.jsx` - Add editing capabilities

### Color Presets

```javascript
const COLOR_PRESETS = [
  { name: 'Cyan', value: '#00ffff' },
  { name: 'Orange', value: '#ff9900' },
  { name: 'Magenta', value: '#ff4f8b' },
  { name: 'Blue', value: '#3b48cc' },
  { name: 'Green', value: '#00ff88' },
  { name: 'White', value: '#ffffff' },
];
```

## Implementation Steps

### Step 1: Add updateNode Action to graphStore
**Files:** `src/stores/graphStore.js` (MODIFY)

**Changes:**
- [ ] Add `updateNode(id, updates)` action that merges updates into matching node

**Validation:**
- [ ] Action updates node properties correctly
- [ ] Non-matching nodes are unchanged

### Step 2: Add Inline Label Editing to NodeInfoPanel
**Files:** `src/components/hud/NodeInfoPanel.jsx` (MODIFY)

**Changes:**
- [ ] Import useState hook
- [ ] Import useGraphStore for updateNode action
- [ ] Add isEditingLabel state
- [ ] Add labelValue state for controlled input
- [ ] Add handleLabelClick to enter edit mode
- [ ] Add handleLabelSave to save and exit edit mode
- [ ] Add handleLabelKeyDown for Enter/Escape handling
- [ ] Replace static label with conditional input/div render
- [ ] Style input to match HUD aesthetic (dark bg, cyan border)
- [ ] Add cursor-pointer and hover effect to clickable label

**Validation:**
- [ ] Clicking label enters edit mode
- [ ] Input shows current label value
- [ ] Enter saves new label
- [ ] Escape cancels edit
- [ ] Clicking outside (blur) saves label
- [ ] Empty label reverts to original

### Step 3: Add Color Picker to NodeInfoPanel
**Files:** `src/components/hud/NodeInfoPanel.jsx` (MODIFY)

**Changes:**
- [ ] Add COLOR_PRESETS constant array
- [ ] Add showColorPicker state
- [ ] Add Color row to panel with swatch button
- [ ] Add color palette popup (absolute positioned)
- [ ] Add useEffect for click-outside-to-close
- [ ] Style palette with grid layout, hover effects
- [ ] Clicking color updates node and closes palette

**Validation:**
- [ ] Color swatch shows current node color
- [ ] Clicking swatch opens palette
- [ ] Palette shows 6 colors in 3x2 grid
- [ ] Clicking color updates node immediately
- [ ] Palette closes after selection
- [ ] Clicking outside palette closes it

### Step 4: Test Integration
**Files:** N/A (manual testing)

**Changes:**
- [ ] Test label editing saves to localStorage
- [ ] Test color change saves to localStorage
- [ ] Test changes persist after page refresh
- [ ] Test works for newly added nodes
- [ ] Test edge connections preserved after editing
- [ ] Test 3D node updates immediately (color change visible)

**Validation:**
- [ ] All edit scenarios work correctly
- [ ] Auto-save triggers on changes

### Step 5: Update Documentation
**Files:** `docs/TASK.md` (MODIFY)

**Changes:**
- [ ] Mark PRP-13 as complete
- [ ] Add session notes
- [ ] Note Phase 4 (Editor) is complete
- [ ] Commit and push

**Validation:**
- [ ] Documentation updated, changes committed

## Dependencies

**No new packages required.**

Uses:
- Existing graphStore infrastructure
- Existing NodeInfoPanel component
- Existing useAutoSave hook for persistence

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | Client-side only | $0.00 |

**Free Tier Eligible:** Yes (no AWS services)

## Testing Strategy

- [ ] Click label text enters edit mode with cursor in input
- [ ] Typing updates input value
- [ ] Enter key saves and exits edit mode
- [ ] Escape key cancels and reverts to original
- [ ] Blur (click outside) saves label
- [ ] Empty label not saved, reverts to original
- [ ] Color swatch displays current node color
- [ ] Click swatch opens color palette
- [ ] Color palette positioned correctly (doesn't overflow viewport)
- [ ] Clicking color in palette updates node
- [ ] Node in 3D scene updates color immediately
- [ ] Palette closes after color selection
- [ ] Click outside palette closes it
- [ ] Changes persist after refresh (localStorage)
- [ ] Edge connections preserved after editing node
- [ ] Can edit label and color in same session
- [ ] Works for newly added nodes

## Rollback Plan

If issues arise:
1. Revert graphStore updateNode addition
2. Revert NodeInfoPanel changes
3. Revert documentation changes

Simple rollback since changes are isolated to two files.

## Open Questions

None - requirements are clear and implementation is straightforward.

