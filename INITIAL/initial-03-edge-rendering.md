# INITIAL: 03 - Edge Rendering

> **File:** `initial-03-edge-rendering.md`
> **Generates:** `prp-03-edge-rendering.md`

## Summary

Create animated edges connecting nodes with curved lines and flowing particle effects. Particles travel along the edge path to visualize data flow between services. This is the signature "data flow" visual from the POC.

## Requirements

### Functional Requirements

1. Create an `Edge3D` component that renders a single edge with:
   - Curved line path between two node positions (QuadraticBezierCurve3)
   - Support for solid or dashed line styles
   - Configurable color
   
2. Create `EdgeParticles` component for animated particles:
   - Multiple particles (4-5) flowing along the edge curve
   - Particles loop continuously from source to target
   - Staggered start positions (not all bunched together)
   - Additive blending for glow effect
   
3. Create an `EdgeGroup` component that renders multiple edges from data

4. Render hardcoded test edges connecting the existing test nodes

5. Support edge properties:
   - `animated`: boolean — whether to show flowing particles
   - `style`: 'solid' | 'dashed' — line appearance

### Non-Functional Requirements

- Maintain 60fps with 10+ animated edges
- Particles should use delta-based animation (consistent with DECISION-010)
- Clean separation: line rendering vs particle animation

## Technical Approach

**Curved Path:**
- Use `THREE.QuadraticBezierCurve3` for smooth curves
- Midpoint raised slightly on Y axis for arc effect
- Extract points from curve for line geometry

**Line Rendering:**
- `THREE.Line` with `BufferGeometry.setFromPoints()`
- `LineBasicMaterial` for solid, `LineDashedMaterial` for dashed
- Must call `computeLineDistances()` for dashed lines to work

**Particle Animation:**
- Use `THREE.Points` with `BufferGeometry`
- Store particle offsets (0-1 along curve)
- Each frame: increment offset, wrap at 1, get position from curve
- Update positions buffer attribute

## Dependencies

No new packages required. Uses existing:
- `three` (QuadraticBezierCurve3, Line, Points, BufferGeometry)
- `@react-three/fiber` (useFrame)

## Data Structure

Follow schema from PLANNING.md:

```javascript
// Test data for this INITIAL
const testEdges = [
  { id: 'e1', source: 'api-gw', target: 'lambda1', animated: true, style: 'solid' },
  { id: 'e2', source: 'lambda1', target: 'dynamodb', animated: true, style: 'solid' },
  { id: 'e3', source: 'lambda1', target: 'eventbridge', animated: true, style: 'dashed' },
  { id: 'e4', source: 'eventbridge', target: 's3', animated: true, style: 'solid' },
];
```

Note: Edge positions derived from node positions at runtime (lookup by id).

## Component Structure

```
src/components/canvas/
├── Edge3D.jsx         # Single edge line + particles
├── EdgeParticles.jsx  # Particle system for one edge (optional: can inline)
├── EdgeGroup.jsx      # Renders array of edges
├── Node3D.jsx         # (existing)
├── NodeGroup.jsx      # (existing)
└── TestBox.jsx        # (existing reference)
```

## Visual Reference

From POC (`reference/poc-visualization.jsx`):

**Curve:**
```javascript
const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
mid.y += 0.5; // Raise midpoint for arc
const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
const points = curve.getPoints(50);
```

**Line:**
```javascript
// Solid
new THREE.LineBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.5 });

// Dashed
new THREE.LineDashedMaterial({ color: 0x00ffff, transparent: true, opacity: 0.4, dashSize: 0.3, gapSize: 0.15 });
line.computeLineDistances(); // Required for dashes
```

**Particles:**
```javascript
new THREE.PointsMaterial({
  color: 0x00ffff,
  size: 0.15,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
});
```

**Particle movement:**
- 5 particles per edge
- Offsets staggered: `[0, 0.2, 0.4, 0.6, 0.8]`
- Each frame: `offset = (offset + delta * speed) % 1`
- Position: `curve.getPoint(offset)`

## Color Scheme

- Default edge: Cyan (#00ffff)
- Dashed edges: Cyan with lower opacity
- Particles: Cyan with additive blending

Future: could derive color from source/target nodes, but keep simple for now.

## Acceptance Criteria

- [ ] Edge3D renders a curved line between two positions
- [ ] Solid lines display as continuous curves
- [ ] Dashed lines display with visible dash pattern
- [ ] EdgeParticles show 4-5 glowing dots per edge
- [ ] Particles flow smoothly from source to target
- [ ] Particles loop continuously (wrap at end)
- [ ] EdgeGroup renders multiple edges from data
- [ ] Test edges connect the existing 5 nodes correctly
- [ ] Scene maintains 60fps with all nodes and edges
- [ ] Animations use delta-based timing

## Out of Scope

- Edge labels/text
- Click to select edges
- Dynamic edge creation/deletion (editor)
- Bidirectional flow (particles going both ways)
- Edge color derived from nodes

## Notes

- Edges need access to node positions — pass nodes array to EdgeGroup or create a lookup map
- Particles are the performance-sensitive part — if needed, reduce particle count or use instancing
- The curve midpoint offset (0.5 on Y) can be adjusted for aesthetics
