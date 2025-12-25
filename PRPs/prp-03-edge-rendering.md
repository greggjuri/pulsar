# PRP: 03 - Edge Rendering

> Generated from: `INITIAL/initial-03-edge-rendering.md`
> Generated on: 2025-12-23
> Confidence: 9/10

## Summary

Create animated edges connecting nodes with curved bezier lines and flowing particle effects. Particles travel along the edge path to visualize data flow between AWS services - the signature "data flow" visual from the POC.

## Requirements Addressed

1. Edge3D component with curved bezier line (solid/dashed styles)
2. EdgeParticles for animated particles flowing along edges
3. EdgeGroup for rendering multiple edges
4. Test edges connecting existing 5 nodes
5. Support for `animated` and `style` edge properties
6. Delta-based animation (per DECISION-010)
7. 60fps performance with 10+ animated edges

## Technical Approach

### Curved Path
- Use `THREE.QuadraticBezierCurve3` with midpoint raised on Y axis for arc effect
- Extract 50 points from curve for smooth line geometry

### Line Rendering
- Solid: `THREE.Line` with `LineBasicMaterial`
- Dashed: `THREE.Line` with `LineDashedMaterial` + `computeLineDistances()`

### Particle Animation
- `THREE.Points` with `BufferGeometry` for particles
- Store offsets (0-1) for each particle's position along curve
- Each frame: increment offset by `delta * speed`, wrap at 1
- Update positions buffer from `curve.getPoint(offset)`
- 5 particles per edge, staggered start positions

### Node Position Lookup
- Pass nodes array to EdgeGroup
- Create lookup map: `{ [node.id]: node.position }`
- Edge3D receives resolved start/end Vector3 positions

## Implementation Steps

### Step 1: Create Test Edge Data
**Files:** `src/data/testEdges.js`
**Changes:**
- [ ] Create `testEdges` array with 4 edges connecting existing nodes
- [ ] Follow schema: `{ id, source, target, animated, style }`

**Validation:**
- [ ] File exports `testEdges` array with 4 edges
- [ ] Edge source/target IDs match existing node IDs

---

### Step 2: Create Edge3D Component
**Files:** `src/components/canvas/Edge3D.jsx`
**Changes:**
- [ ] Accept props: `start`, `end`, `color`, `style`, `animated`
- [ ] Create QuadraticBezierCurve3 with raised midpoint
- [ ] Render Line with appropriate material (solid/dashed)
- [ ] Call `computeLineDistances()` for dashed lines
- [ ] Use useMemo for curve/points to avoid recalculation

**Validation:**
- [ ] Renders curved line between two positions
- [ ] Solid style shows continuous line
- [ ] Dashed style shows visible dash pattern

---

### Step 3: Add Particle Animation to Edge3D
**Files:** `src/components/canvas/Edge3D.jsx`
**Changes:**
- [ ] Add useRef for particle positions buffer
- [ ] Create Points geometry with 5 particles
- [ ] Initialize staggered offsets: [0, 0.2, 0.4, 0.6, 0.8]
- [ ] In useFrame: update offsets with delta-based timing
- [ ] Update positions buffer and set needsUpdate = true
- [ ] Use AdditiveBlending for glow effect
- [ ] Only render particles if `animated` prop is true

**Validation:**
- [ ] 5 particles visible on animated edges
- [ ] Particles flow smoothly from start to end
- [ ] Particles loop continuously (wrap at end)
- [ ] Non-animated edges show no particles

---

### Step 4: Create EdgeGroup Component
**Files:** `src/components/canvas/EdgeGroup.jsx`
**Changes:**
- [ ] Accept props: `edges`, `nodes`
- [ ] Create node position lookup map
- [ ] Map edges to Edge3D components
- [ ] Resolve source/target IDs to Vector3 positions
- [ ] Handle missing nodes gracefully (skip edge)

**Validation:**
- [ ] Renders all edges from data array
- [ ] Each edge connects correct nodes

---

### Step 5: Integrate into App
**Files:** `src/App.jsx`
**Changes:**
- [ ] Import EdgeGroup and testEdges
- [ ] Add EdgeGroup to Canvas with edges and nodes props
- [ ] Position EdgeGroup after NodeGroup (render order)

**Validation:**
- [ ] Test edges render in scene
- [ ] Edges connect nodes correctly
- [ ] Particles animate along edges
- [ ] Scene maintains 60fps

---

### Step 6: Update Documentation
**Files:** `docs/TASK.md`
**Changes:**
- [ ] Mark PRP-03 as complete
- [ ] Add session notes
- [ ] Update next steps

**Validation:**
- [ ] TASK.md reflects completed work
- [ ] Git commit and push

## Dependencies

No new packages required. Uses existing:
- `three` (QuadraticBezierCurve3, Line, Points, BufferGeometry, Vector3)
- `@react-three/fiber` (useFrame, extend)

## Testing Strategy

- [ ] Visual: Curved lines connect correct node pairs
- [ ] Visual: Solid vs dashed styles are distinguishable
- [ ] Visual: Particles flow in correct direction (source → target)
- [ ] Visual: Particles have glow effect (additive blending)
- [ ] Performance: Scene maintains 60fps with all edges animated
- [ ] Console: No errors or warnings

## Rollback Plan

If issues arise:
1. Remove EdgeGroup from App.jsx (edges disappear, nodes remain)
2. Delete new files (Edge3D.jsx, EdgeGroup.jsx, testEdges.js)
3. Git revert to previous commit

## Open Questions

None - requirements are clear and implementation pattern is established in POC.

## Code Reference

From POC (`reference/poc-visualization.jsx:114-178`):
- Curve creation pattern (lines 124-128)
- Line material setup (lines 131-153)
- Particle system creation (lines 156-178)
- Particle animation loop (lines 314-325)

## Color Scheme

| Element | Color | Opacity |
|---------|-------|---------|
| Solid line | #00ff88 (green-cyan) | 0.5 |
| Dashed line | #00ffff (cyan) | 0.4 |
| Particles | #00ffff (cyan) | 0.8 |

## Performance Notes

- Particles are the performance-sensitive part
- 5 particles × 4 edges = 20 points (trivial)
- Buffer updates each frame, but small buffer size
- If needed later: reduce particle count or use instancing
