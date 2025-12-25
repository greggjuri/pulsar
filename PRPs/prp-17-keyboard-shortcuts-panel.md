# PRP: 17 - Keyboard Shortcuts Panel

> Generated from: `INITIAL/initial-17-keyboard-shortcuts-panel.md`
> Generated on: 2025-12-25
> Confidence: 10/10

## Summary

Add a help panel that displays all available keyboard shortcuts in one place. The panel opens with `?` key and closes with `?`, `ESC`, or clicking outside. Styled to match the sci-fi HUD aesthetic.

## Requirements Addressed

1. **Shortcuts Panel** - Modal displaying all shortcuts grouped by category
2. **Toggle Trigger** - `?` key to open/close, ESC to close, backdrop click to close
3. **Sci-Fi Styling** - Match existing HUD aesthetic with cyan accents
4. **Maintainable** - Shortcuts defined in single config array

## Technical Approach

### Data Structure

Centralized shortcuts config in `src/data/shortcuts.js`:
- Array of category objects
- Each category has name and array of shortcuts
- Each shortcut has keys array and description
- Easy to extend when new features are added

### Panel Component

Modal overlay with:
- Semi-transparent backdrop (closes panel on click)
- Centered panel with category sections
- Keys displayed in monospace, right-aligned
- Descriptions left-aligned

### State Management

Local state in App.jsx (no need for Zustand):
- `showShortcuts` boolean state
- Added to existing keyboard handler
- `?` toggles panel, ESC closes if open

### Integration

Panel renders alongside HudOverlay, outside Canvas.

## Implementation Steps

### Step 1: Create Shortcuts Configuration
**Files:** `src/data/shortcuts.js` (NEW)

**Changes:**
- [x] Create SHORTCUTS array with categories
- [x] Include Navigation, Selection, Editing, Help categories
- [x] Document all current shortcuts

**Validation:**
- [x] File exports SHORTCUTS constant
- [x] All current shortcuts are documented

### Step 2: Create ShortcutsPanel Component
**Files:** `src/components/hud/ShortcutsPanel.jsx` (NEW)

**Changes:**
- [x] Create modal component with backdrop
- [x] Render categories and shortcuts from config
- [x] Style with sci-fi aesthetic (cyan accents, monospace keys)
- [x] Add close hint text at bottom

**Validation:**
- [x] Component renders when isOpen=true
- [x] Component returns null when isOpen=false
- [x] Backdrop onClick calls onClose
- [x] Styling matches existing HUD panels

### Step 3: Integrate Panel in App.jsx
**Files:** `src/App.jsx` (MODIFY)

**Changes:**
- [x] Add `showShortcuts` state
- [x] Add `?` key handler to toggle panel
- [x] Modify ESC handler to close shortcuts panel if open
- [x] Import and render ShortcutsPanel component

**Validation:**
- [x] `?` opens panel
- [x] `?` closes panel when open
- [x] ESC closes panel
- [x] Backdrop click closes panel
- [x] Other keyboard shortcuts still work when panel is closed

### Step 4: Update Documentation
**Files:** `docs/TASK.md` (MODIFY)

**Changes:**
- [x] Mark PRP-17 as complete
- [x] Add session notes
- [x] Commit and push

**Validation:**
- [x] Documentation updated, changes committed

## Dependencies

**No new packages required.**

Uses:
- React useState for panel visibility
- Existing Tailwind classes for styling
- Existing keyboard event pattern from App.jsx

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | Frontend-only feature | $0.00 |

**Free Tier Eligible:** Yes (no AWS services)

## Testing Strategy

- [ ] Press `?` to open shortcuts panel
- [ ] Press `?` again to close panel
- [ ] Press `ESC` to close panel
- [ ] Click backdrop to close panel
- [ ] All shortcuts listed match actual functionality
- [ ] Panel styled with sci-fi aesthetic
- [ ] Keys displayed in monospace font
- [ ] Panel centered on screen
- [ ] Other shortcuts (F, R, DEL) work when panel is closed
- [ ] Panel doesn't open when typing in input fields

## Rollback Plan

If issues arise:
1. Remove ShortcutsPanel import and render from App.jsx
2. Remove showShortcuts state and keyboard handling
3. Delete ShortcutsPanel.jsx and shortcuts.js

No external dependencies to uninstall.

## Open Questions

All resolved:
1. **Trigger key:** Using `?` (Shift+/) as specified
2. **Help button:** Keyboard-only for MVP (can add button later)
3. **Position:** Centered modal as shown in INITIAL spec
