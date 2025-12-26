# INITIAL-19: Label and Icon Visibility Toggles

## Problem Statement

With the addition of AWS service icons (PRP-18), nodes now display both an icon and a text label. While this provides maximum information, some users may prefer a cleaner view with just icons, just labels, or neither — especially when zoomed out or presenting a high-level overview.

## User Story

**As a** user viewing an architecture diagram  
**I want** to toggle the visibility of node labels and icons independently  
**So that** I can customize the visual density based on my current needs

## Goals

1. Toggle labels on/off independently
2. Toggle icons on/off independently
3. Persist preferences across sessions
4. Quick access via keyboard shortcuts

## Non-Goals

- Per-node visibility settings (global only)
- Fade/animation when toggling (instant is fine)
- Auto-hide based on zoom level (future enhancement)

## Design

### Toggle States

| Labels | Icons | Result |
|--------|-------|--------|
| ON | ON | Full display (current default) |
| ON | OFF | Labels only (like before PRP-18) |
| OFF | ON | Icons only (clean, visual) |
| OFF | OFF | Just glowing nodes (minimal) |

### UI Location

Add toggles to the existing HUD. Two options:

**Option A: ViewControlsPanel (bottom-left)**
Add alongside existing camera controls (Fit, Reset). Simple icon buttons with tooltips.

```
┌─────────────────────────────────────────┐
│  [F] FIT  [R] RESET  │  [🏷] [🖼]       │
└─────────────────────────────────────────┘
                         ↑ label  ↑ icon
```

**Option B: New DisplayPanel (top area)**
Separate panel for display settings.

**Recommendation:** Option A — keeps related view controls together, no new panel needed.

### Keyboard Shortcuts

- `L` — Toggle labels
- `I` — Toggle icons

These don't conflict with existing shortcuts (F, R, Home, Delete, Escape, ?).

### State Management

Add to `graphStore.js` (or create `settingsStore.js` if we want separation):

```javascript
// In graphStore.js
showLabels: true,
showIcons: true,
toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
toggleIcons: () => set((s) => ({ showIcons: !s.showIcons })),
```

### Persistence

Save to localStorage alongside existing diagram data, or as separate settings key:

```javascript
localStorage.setItem('pulsar-display-settings', JSON.stringify({
  showLabels: true,
  showIcons: true,
}));
```

Load on app init.

## Technical Requirements

### Functional Requirements

1. **FR-1: Label Toggle**
   - Toggle button in HUD shows current state
   - Clicking toggles label visibility for all nodes
   - `L` keyboard shortcut works
   
2. **FR-2: Icon Toggle**
   - Toggle button in HUD shows current state
   - Clicking toggles icon visibility for all nodes
   - `I` keyboard shortcut works

3. **FR-3: Persistence**
   - Settings saved to localStorage
   - Settings restored on page load
   - Default: both ON

4. **FR-4: Visual Feedback**
   - Toggle buttons show active/inactive state
   - Tooltips indicate current state and shortcut

## Component Changes

| File | Change |
|------|--------|
| `src/stores/graphStore.js` | Add `showLabels`, `showIcons` state + toggles |
| `src/components/canvas/Node3D.jsx` | Conditionally render icon/label based on store |
| `src/components/hud/ViewControlsPanel.jsx` | Add toggle buttons |
| `src/data/shortcuts.js` | Add L and I shortcuts |
| `src/hooks/useKeyboardShortcuts.js` | Handle L and I keys |

## UI Design

Toggle buttons in ViewControlsPanel:

```jsx
{/* Label toggle */}
<button
  onClick={toggleLabels}
  className={`px-2 py-1 rounded ${showLabels ? 'bg-cyan-500/30 text-cyan-400' : 'text-cyan-500/50'}`}
  title={`${showLabels ? 'Hide' : 'Show'} labels (L)`}
>
  <span className="text-xs">ABC</span>
</button>

{/* Icon toggle */}
<button
  onClick={toggleIcons}
  className={`px-2 py-1 rounded ${showIcons ? 'bg-cyan-500/30 text-cyan-400' : 'text-cyan-500/50'}`}
  title={`${showIcons ? 'Hide' : 'Show'} icons (I)`}
>
  <span className="text-xs">🖼</span>
</button>
```

## Acceptance Criteria

- [ ] Label toggle button visible in ViewControlsPanel
- [ ] Icon toggle button visible in ViewControlsPanel  
- [ ] Clicking label toggle hides/shows all node labels
- [ ] Clicking icon toggle hides/shows all node icons
- [ ] `L` key toggles labels
- [ ] `I` key toggles icons
- [ ] Toggle state persists across page refresh
- [ ] Buttons show active/inactive visual state
- [ ] Tooltips show shortcut hint
- [ ] Default state: both ON
- [ ] Shortcuts panel updated with L and I entries

## Out of Scope

- Per-node visibility
- Zoom-based auto-hide
- Animation/fade effects
- Edge label toggles (we don't have edge labels yet)

---

**Ready for handoff to Claude Code** — Once approved, use `/generate-prp` to create the implementation plan.
