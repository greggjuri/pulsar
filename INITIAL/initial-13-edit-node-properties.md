# INITIAL: 13 - Edit Node Properties

> **File:** `initial-13-edit-node-properties.md`  
> **Generates:** `prp-13-edit-node-properties.md`

## Summary

Enable editing of node properties through the NodeInfoPanel. Users can modify:
- **Label** — The display name shown on hover/selection
- **Color** — Choose from a preset palette matching the sci-fi theme

This completes Phase 4 (Editor) by giving users full control over their diagram's appearance.

## Requirements

### Functional Requirements

#### 1. Editable Label

Make the label in NodeInfoPanel editable:
- Click the label text to enter edit mode
- Show a text input field styled to match HUD aesthetic
- Press **Enter** or click outside to save
- Press **Escape** to cancel (revert to original)
- Empty labels not allowed (revert to original if empty)

#### 2. Color Picker

Add a color selection row to NodeInfoPanel:
- Display current color as a swatch
- Click swatch to show color palette
- Palette shows preset colors (no custom color picker for MVP):
  - Cyan: `#00ffff` (default for new nodes)
  - Orange: `#ff9900` (AWS orange)
  - Magenta: `#ff4f8b`
  - Blue: `#3b48cc`
  - Green: `#00ff88`
  - White: `#ffffff`
- Clicking a color updates the node immediately
- Palette closes after selection or on outside click

#### 3. Store Actions

Add to graphStore:

```javascript
updateNode: (id, updates) => set((state) => ({
  nodes: state.nodes.map(node =>
    node.id === id ? { ...node, ...updates } : node
  ),
})),
```

This generic action supports updating any node property (label, color, type, etc.).

#### 4. Auto-Save

Existing `useAutoSave` hook handles persistence automatically when nodes change.

### Non-Functional Requirements

- Edits should feel instant (no save button, no loading states)
- Color palette should not overflow viewport
- Maintain 60fps during editing
- Tab order: label input should be focusable

## Technical Approach

### Inline Label Editing

```jsx
// In NodeInfoPanel.jsx
const [isEditingLabel, setIsEditingLabel] = useState(false);
const [labelValue, setLabelValue] = useState(node.label);

const handleLabelClick = () => {
  setIsEditingLabel(true);
  setLabelValue(node.label);
};

const handleLabelSave = () => {
  if (labelValue.trim()) {
    updateNode(node.id, { label: labelValue.trim() });
  }
  setIsEditingLabel(false);
};

const handleLabelKeyDown = (e) => {
  if (e.key === 'Enter') {
    handleLabelSave();
  } else if (e.key === 'Escape') {
    setIsEditingLabel(false);
    setLabelValue(node.label); // Revert
  }
};

// Render
{isEditingLabel ? (
  <input
    type="text"
    value={labelValue}
    onChange={(e) => setLabelValue(e.target.value)}
    onBlur={handleLabelSave}
    onKeyDown={handleLabelKeyDown}
    autoFocus
    className="bg-black/50 border border-cyan-500/50 text-cyan-400 px-2 py-1 
               text-lg font-mono outline-none focus:border-cyan-400"
  />
) : (
  <div onClick={handleLabelClick} className="cursor-pointer hover:text-white">
    {node.label}
  </div>
)}
```

### Color Palette Component

Create a small reusable component or inline in NodeInfoPanel:

```jsx
const COLOR_PRESETS = [
  { name: 'Cyan', value: '#00ffff' },
  { name: 'Orange', value: '#ff9900' },
  { name: 'Magenta', value: '#ff4f8b' },
  { name: 'Blue', value: '#3b48cc' },
  { name: 'Green', value: '#00ff88' },
  { name: 'White', value: '#ffffff' },
];

const [showColorPicker, setShowColorPicker] = useState(false);

// Render
<div className="flex justify-between py-1 border-b border-gray-700">
  <span className="text-gray-400">Color:</span>
  <div className="relative">
    <button
      onClick={() => setShowColorPicker(!showColorPicker)}
      className="w-6 h-6 rounded border border-cyan-500/50 hover:border-cyan-400"
      style={{ backgroundColor: node.color }}
      title="Change color"
    />
    {showColorPicker && (
      <div className="absolute right-0 top-8 bg-black/90 border border-cyan-500/50 
                      rounded p-2 grid grid-cols-3 gap-2 z-10">
        {COLOR_PRESETS.map(({ name, value }) => (
          <button
            key={value}
            onClick={() => {
              updateNode(node.id, { color: value });
              setShowColorPicker(false);
            }}
            className="w-8 h-8 rounded border border-gray-600 hover:border-cyan-400 
                       hover:scale-110 transition-transform"
            style={{ backgroundColor: value }}
            title={name}
          />
        ))}
      </div>
    )}
  </div>
</div>
```

### Click Outside to Close

For the color picker, add a click-outside handler:

```jsx
useEffect(() => {
  if (!showColorPicker) return;
  
  const handleClickOutside = (e) => {
    if (!e.target.closest('.color-picker-container')) {
      setShowColorPicker(false);
    }
  };
  
  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, [showColorPicker]);
```

## Component Changes

| File | Change |
|------|--------|
| `src/stores/graphStore.js` | Add `updateNode(id, updates)` action |
| `src/components/hud/NodeInfoPanel.jsx` | Add inline label editing, color picker |

## Props / API Changes

**graphStore** — Add action:
- `updateNode: (id: string, updates: Partial<Node>) => void`

**NodeInfoPanel** — Internal changes only, no prop changes

## Dependencies

No new packages required.

## Acceptance Criteria

### Label Editing
- [ ] Clicking label text enters edit mode
- [ ] Input field shows current label value
- [ ] Enter key saves the new label
- [ ] Escape key cancels and reverts
- [ ] Clicking outside saves the label
- [ ] Empty label reverts to original (not saved)
- [ ] Node label updates in 3D scene immediately
- [ ] Label change persists after refresh (auto-save)

### Color Picker
- [ ] Color swatch shows current node color
- [ ] Clicking swatch opens color palette
- [ ] Palette shows 6 preset colors
- [ ] Clicking a color updates the node immediately
- [ ] Node color updates in 3D scene immediately
- [ ] Palette closes after color selection
- [ ] Clicking outside palette closes it
- [ ] Color change persists after refresh (auto-save)

### General
- [ ] Stats panel unaffected (no node/edge count change)
- [ ] Edge connections preserved when editing node
- [ ] Can edit label and color in same session
- [ ] Works for newly added nodes

## Visual Reference

**NodeInfoPanel with editing capabilities:**

```
┌─────────────────────────────────────┐
│ [API Gateway]  ← click to edit    × │
├─────────────────────────────────────┤
│ Type:      APIGATEWAY               │
│ ID:        api-gw                   │
│ Color:     [■] ← click for palette  │
│ Status:    ● ACTIVE                 │
└─────────────────────────────────────┘
```

**Label in edit mode:**
```
┌─────────────────────────────────────┐
│ [___________________]  ← input    × │
├─────────────────────────────────────┤
│ ...                                 │
```

**Color palette open:**
```
│ Color:     [■]                      │
│            ┌─────────────┐          │
│            │ ■  ■  ■     │          │
│            │ ■  ■  ■     │          │
│            └─────────────┘          │
```

## Out of Scope (Deferred to Phase 5: Polish)

- **Type editing** — Dropdown to change AWS service type (affects future icons)
- **Custom color picker** — Full RGB/HSL picker with any color
- **Position editing** — Manual X/Y/Z coordinate input
- **Metadata editing** — Custom key/value pairs
- **Bulk editing** — Edit multiple selected nodes at once
- **Edit via context menu** — "Edit..." menu option (we're using inline editing instead)

## Architecture Notes

### Generic `updateNode` Action

The `updateNode(id, updates)` pattern is flexible — it accepts any partial node object. This supports future property editing without new actions:

```javascript
// Current use
updateNode(id, { label: 'New Name' });
updateNode(id, { color: '#ff9900' });

// Future use
updateNode(id, { type: 'lambda' });
updateNode(id, { position: [0, 0, 0] });
updateNode(id, { metadata: { ... } });
```

### Inline vs Modal Editing

We chose inline editing in NodeInfoPanel because:
- Faster workflow (no modal open/close)
- Context preserved (see the node while editing)
- Simpler implementation
- Matches modern UI patterns (click-to-edit)

A dedicated edit modal could be added later for complex editing scenarios.

---

**Ready for handoff to Claude Code** — Once you approve this spec, take it to Claude Code with `/generate-prp` to create the implementation plan.
