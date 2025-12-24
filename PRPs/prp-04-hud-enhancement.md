# PRP: 04 - HUD Enhancement

> Generated from: `INITIAL/initial-04-hud-enhancement.md`
> Generated on: 2024-12-23
> Confidence: 9/10

## Summary

Enhance the 2D HUD overlay with full sci-fi styling. Extract HUD elements from App.jsx into dedicated components. Add controls panel, stats panel with live counts, corner brackets, and scanline overlay. This completes the Phase 1 visual foundation.

## Requirements Addressed

1. Header panel with PULSAR title and glow effect
2. Controls panel showing interaction hints (drag, zoom, click)
3. Stats panel with live node/edge counts and status indicator
4. Corner brackets in all four corners
5. Scanline overlay for retro sci-fi effect
6. HUD elements don't block 3D interaction
7. Consistent styling across all panels

## Technical Approach

### Component Architecture
- Extract HUD from App.jsx into `src/components/hud/` directory
- HudOverlay as main container that composes all HUD elements
- Pass node/edge counts from App to StatsPanel via props
- Use `pointer-events-none` on container, `pointer-events-auto` only where needed

### Styling
- Tailwind CSS for all styling (consistent with existing codebase)
- Panel styling: `bg-black/50 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm`
- Text glow via inline `textShadow` style (only exception to Tailwind-only)
- Cyan accent color throughout (`text-cyan-400`, `border-cyan-500/30`)

## Implementation Steps

### Step 1: Create HeaderPanel Component
**Files:** `src/components/hud/HeaderPanel.jsx`
**Changes:**
- [ ] Create component with PULSAR title and glow effect
- [ ] Add subtitle "AWS ARCHITECTURE VISUALIZER"
- [ ] Use font-mono and tracking-wider for sci-fi feel

**Validation:**
- [ ] Component renders title with cyan glow
- [ ] Subtitle displays below title

---

### Step 2: Create ControlsPanel Component
**Files:** `src/components/hud/ControlsPanel.jsx`
**Changes:**
- [ ] Create component with semi-transparent panel styling
- [ ] Add "CONTROLS" header
- [ ] List three control hints with emoji icons
- [ ] Style consistently with POC reference

**Validation:**
- [ ] Panel displays in top-right position (when used)
- [ ] Control hints readable and styled

---

### Step 3: Create StatsPanel Component
**Files:** `src/components/hud/StatsPanel.jsx`
**Changes:**
- [ ] Accept `nodeCount` and `edgeCount` props
- [ ] Display "Nodes: {count}" and "Connections: {count}"
- [ ] Add "DATA FLOW: ACTIVE" with pulsing green dot
- [ ] Use `animate-pulse` for status indicator

**Validation:**
- [ ] Counts display correctly
- [ ] Green dot pulses

---

### Step 4: Create CornerBrackets Component
**Files:** `src/components/hud/CornerBrackets.jsx`
**Changes:**
- [ ] Create four corner bracket decorations
- [ ] Position absolutely in each corner
- [ ] Use cyan border at 30% opacity
- [ ] Size: 16x16 (w-16 h-16)

**Validation:**
- [ ] Brackets visible in all four corners
- [ ] Subtle cyan color

---

### Step 5: Create HudOverlay Container
**Files:** `src/components/hud/HudOverlay.jsx`
**Changes:**
- [ ] Create main HUD container with `pointer-events-none`
- [ ] Import and compose all HUD components
- [ ] Accept `nodeCount` and `edgeCount` props
- [ ] Add scanline overlay div
- [ ] Position children appropriately (header top-left, controls top-right, stats bottom-right)

**Validation:**
- [ ] All HUD elements render
- [ ] 3D scene interaction not blocked

---

### Step 6: Integrate HudOverlay into App
**Files:** `src/App.jsx`
**Changes:**
- [ ] Import HudOverlay component
- [ ] Replace existing HUD div with HudOverlay
- [ ] Pass testNodes.length and testEdges.length as props
- [ ] Remove old inline HUD code

**Validation:**
- [ ] HUD displays correctly
- [ ] Node/edge counts show correct values (5 nodes, 4 edges)
- [ ] OrbitControls still work (3D interaction not blocked)
- [ ] Scanlines visible but subtle

---

### Step 7: Create Index Export
**Files:** `src/components/hud/index.js`
**Changes:**
- [ ] Export all HUD components for clean imports
- [ ] Remove .gitkeep file

**Validation:**
- [ ] Components can be imported from 'components/hud'

---

### Step 8: Update Documentation
**Files:** `docs/TASK.md`
**Changes:**
- [ ] Mark PRP-04 as complete
- [ ] Add session notes
- [ ] Update next steps

**Validation:**
- [ ] TASK.md reflects completed work
- [ ] Git commit and push

## Dependencies

No new packages required. Uses existing:
- Tailwind CSS v4 (via @tailwindcss/vite)
- React

## Testing Strategy

- [ ] Visual: Header displays with glow effect
- [ ] Visual: Controls panel shows three hints
- [ ] Visual: Stats panel shows correct counts (5 nodes, 4 edges)
- [ ] Visual: Green status dot pulses
- [ ] Visual: Corner brackets visible in all corners
- [ ] Visual: Scanlines subtle but visible
- [ ] Interaction: OrbitControls still work (drag, zoom)
- [ ] Console: No errors or warnings

## Rollback Plan

If issues arise:
1. Restore old HUD div in App.jsx
2. Delete new files in `src/components/hud/`
3. Git revert to previous commit

## Open Questions

None - requirements are clear and styling patterns established in POC.

## Component Props Reference

| Component | Props | Description |
|-----------|-------|-------------|
| HudOverlay | `nodeCount`, `edgeCount` | Main container, passes counts to StatsPanel |
| HeaderPanel | none | Static title display |
| ControlsPanel | none | Static control hints |
| StatsPanel | `nodeCount`, `edgeCount` | Live counts + status |
| CornerBrackets | none | Decorative corners |

## Styling Reference

```jsx
// Panel base
className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm"

// Text glow (inline style)
style={{ textShadow: '0 0 10px cyan' }}

// Pulsing dot
className="w-2 h-2 bg-green-400 rounded-full animate-pulse"

// Corner bracket
className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-cyan-500/30"
```
