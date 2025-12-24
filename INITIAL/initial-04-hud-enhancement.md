# INITIAL: 04 - HUD Enhancement

> **File:** `initial-04-hud-enhancement.md`
> **Generates:** `prp-04-hud-enhancement.md`

## Summary

Enhance the 2D HUD overlay with full sci-fi styling. Add controls panel, stats panel, and refine visual elements like corner brackets and scanlines. This completes the Phase 1 visual foundation.

## Requirements

### Functional Requirements

1. **Header Panel** (top-left) — already exists, minor refinements:
   - "PULSAR" title with glow
   - Subtitle: "AWS ARCHITECTURE VISUALIZER"

2. **Controls Panel** (top-right):
   - Panel with semi-transparent background
   - Border with cyan accent
   - List controls:
     - 🖱️ Drag to rotate
     - 🔍 Scroll to zoom
     - 👆 Click node for info (preview for Phase 2)

3. **Stats Panel** (bottom-right):
   - Show live counts from data:
     - Nodes: {count}
     - Connections: {count}
   - Status indicator: "DATA FLOW: ACTIVE" with pulsing dot

4. **Corner Brackets** (all four corners):
   - Already exist — verify styling is consistent
   - Cyan color at 30% opacity

5. **Scanline Overlay**:
   - Already exists — verify it's subtle (5% opacity)
   - Should not interfere with readability

### Non-Functional Requirements

- HUD elements don't block 3D interaction (pointer-events: none where needed)
- Responsive — panels stay positioned correctly on resize
- Consistent styling (font-mono, cyan accent, dark backgrounds)

## Component Structure

```
src/components/hud/
├── HudOverlay.jsx      # Main container, composes all HUD elements
├── HeaderPanel.jsx     # PULSAR title + subtitle
├── ControlsPanel.jsx   # Controls help text
├── StatsPanel.jsx      # Node/edge counts + status
└── CornerBrackets.jsx  # Four corner decorations
```

## Technical Approach

- Extract HUD from App.jsx into dedicated components
- Pass node/edge counts as props to StatsPanel
- Use Tailwind for all styling (no inline styles except text-shadow)
- Keep scanline overlay in HudOverlay as a full-screen div

## Visual Reference

From POC (`reference/poc-visualization.jsx`):

**Panel styling:**
```jsx
className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm"
```

**Text glow:**
```jsx
style={{ textShadow: '0 0 10px cyan' }}
```

**Pulsing status dot:**
```jsx
<span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
```

**Corner brackets:**
```jsx
<div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-cyan-500/30" />
```

## Props Required

**StatsPanel:**
- `nodeCount: number`
- `edgeCount: number`

## Acceptance Criteria

- [ ] HUD extracted into separate components under `src/components/hud/`
- [ ] HeaderPanel displays title with glow effect
- [ ] ControlsPanel shows three control hints with icons
- [ ] StatsPanel shows correct node/edge counts from data
- [ ] StatsPanel shows "DATA FLOW: ACTIVE" with pulsing green dot
- [ ] Corner brackets visible in all four corners
- [ ] Scanline overlay subtle but visible
- [ ] 3D scene interaction still works (OrbitControls not blocked)
- [ ] Styling is consistent across all panels

## Out of Scope

- Node info panel (requires selection — Phase 2)
- Minimap
- Toolbar/action buttons
- Theme customization

## Notes

- The counts should derive from testNodes.length and testEdges.length for now
- Later these will come from Zustand store
- Keep components simple — they're mostly presentational
