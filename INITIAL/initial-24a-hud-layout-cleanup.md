# INITIAL-24a: HUD Layout Cleanup

## Overview

Fix overlapping UI elements and consolidate the HUD layout. The recent cloud integration additions created visual conflicts in both top corners.

**Phase:** 6 (Backend Integration - Polish)
**Depends On:** INITIAL-24 (Frontend Cloud Integration)
**Type:** Bug fix / UI polish

## Problem

Current layout has overlapping elements:

**Top-left issues:**
- PULSAR header
- "AWS ARCHITECTURE VISUALIZER" subtitle
- Diagram name input field (new, overlapping header)
- FileControlsPanel (NEW, NODE, EXPORT, IMPORT)
- CloudDiagramsPanel (MY DIAGRAMS)

**Top-right issues:**
- AuthPanel (email, Sign Out)
- ModeIndicator (CLOUD) - overlapping ControlsPanel
- ControlsPanel (hints, buttons)

**Bottom-left issues:**
- SaveCloudButton positioned awkwardly

## Solution

Consolidate into a cleaner layout with proper spacing.

### Target Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  PULSAR ─ [Diagram Name____] [SAVE]         user@email · CLOUD  Sign Out │
│                                                                          │
│  + NEW  + NODE  ↓ EXPORT  ↑ IMPORT                                       │
│                                                                          │
│  ┌─────────────────┐                                 ┌─────────────────┐ │
│  │ MY DIAGRAMS     │                                 │ Drag to rotate  │ │
│  ├─────────────────┤                                 │ Scroll to zoom  │ │
│  │ ▸ Prod Arch     │                                 │ Click to select │ │
│  │   8 nodes       │                                 │ Right-click menu│ │
│  ├─────────────────┤          3D CANVAS              ├─────────────────┤ │
│  │   Dev Setup     │                                 │ ⊞Fit ↺Reset ?   │ │
│  ├─────────────────┤                                 │ LABEL    ICON   │ │
│  │ [+ NEW DIAGRAM] │                                 └─────────────────┘ │
│  └─────────────────┘                                                     │
│                                                      ┌─────────────────┐ │
│                                                      │ Nodes: 5        │ │
│                                                      │ Connections: 3  │ │
│                                                      │ Data: ● ACTIVE  │ │
│                                                      └─────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Key Changes

1. **New Header Bar Component**
   - Single row: Logo + Diagram Name (editable) + Save Button + Auth Info + Mode Badge + Sign Out
   - Replaces: separate HeaderPanel, DiagramNameInput, SaveCloudButton, AuthPanel, ModeIndicator
   - Position: `fixed top-0 left-0 right-0`

2. **Remove ModeIndicator Component**
   - Mode badge ("CLOUD" or "LOCAL") integrated into header bar
   - Delete `src/components/hud/ModeIndicator.jsx`

3. **Move Save Button**
   - From bottom-left floating to header bar (right side, before auth)
   - Delete separate SaveCloudButton or repurpose as header element

4. **Adjust CloudDiagramsPanel Position**
   - Move down to `top-20` or similar to clear header bar
   - Currently at `top-32`, may need adjustment

5. **Keep ControlsPanel As-Is**
   - Already positioned correctly on right side
   - Just ensure it doesn't overlap with header

## Component Changes

### Create: `src/components/hud/HeaderBar.jsx`

Unified header containing:
- PULSAR logo (left)
- Editable diagram name input
- Save button (shows "SAVE" or "SAVING...", yellow border when unsaved)
- User email (when authenticated)
- Mode badge: "CLOUD" (cyan) or "LOCAL" (gray)
- Sign Out link (when authenticated) / Sign In link (when not)

### Modify: `src/components/hud/AuthPanel.jsx`

Either:
- Delete entirely (functionality moved to HeaderBar), OR
- Simplify to just return null (keep for potential future use)

### Delete: `src/components/hud/ModeIndicator.jsx`

Functionality merged into HeaderBar.

### Modify: `src/components/hud/SaveCloudButton.jsx`

Either:
- Delete entirely (functionality moved to HeaderBar), OR
- Convert to a smaller inline button component used within HeaderBar

### Modify: `src/components/hud/CloudDiagramsPanel.jsx`

- Adjust top position to clear new header bar
- Change from `top-32` to appropriate value (e.g., `top-16`)

### Modify: `src/components/hud/HudOverlay.jsx` or `HeaderPanel.jsx`

- Remove or simplify existing header (PULSAR title moves to HeaderBar)
- Keep corner brackets if desired

### Modify: `src/App.jsx`

- Remove: AuthPanel, ModeIndicator, SaveCloudButton imports
- Add: HeaderBar import
- Update component tree

## Acceptance Criteria

- [ ] No overlapping UI elements
- [ ] Header bar contains: logo, diagram name, save, auth info, mode badge
- [ ] Diagram name is editable (click to edit, Enter to save, Escape to cancel)
- [ ] Save button shows loading state and unsaved indicator
- [ ] Mode badge shows "CLOUD" when authenticated, "LOCAL" when not
- [ ] CloudDiagramsPanel doesn't overlap header
- [ ] ControlsPanel doesn't overlap header
- [ ] All existing functionality preserved
- [ ] Sci-fi aesthetic maintained (cyan accents, dark bg, monospace)

## Styling Guidelines

**Header Bar:**
- Background: `bg-black/80` or `bg-black/90`
- Border: `border-b border-cyan-500/30`
- Height: ~48px (`h-12`)
- Full width: `fixed top-0 left-0 right-0`
- Z-index: `z-50`

**Diagram Name Input:**
- Inline editable (looks like text until clicked)
- Monospace font
- Cyan text, subtle border on focus
- Max width ~200px, truncate with ellipsis

**Mode Badge:**
- Small pill/badge shape
- CLOUD: cyan bg/border
- LOCAL: gray bg/border
- Uppercase, tiny text

## Non-Goals

- Redesigning ControlsPanel
- Redesigning StatsPanel
- Changing CloudDiagramsPanel content (just position)
- Mobile responsiveness (desktop-first for now)

## Cost Estimate

$0.00 - Frontend-only UI changes.
