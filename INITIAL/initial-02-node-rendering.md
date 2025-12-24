# INITIAL: 02 - Node Rendering

> **File:** `initial-02-node-rendering.md`
> **Generates:** `prp-02-node-rendering.md`

## Summary

Create the core 3D node component with sci-fi holographic aesthetic. Nodes should have glowing cores, outer glow halos, animated rotating rings, and subtle bobbing motion. Render a hardcoded set of test nodes to verify the visual style matches the POC.

## Requirements

### Functional Requirements

1. Create a `Node3D` component that renders a single node with:
   - Icosahedron core geometry (not a plain sphere — more sci-fi)
   - Semi-transparent outer glow sphere
   - Two rotating wireframe rings at different angles
   - Configurable color (passed as prop)
   
2. Implement node animations:
   - Rings rotate continuously at slightly different speeds
   - Subtle vertical bobbing motion (sine wave)
   
3. Create a `NodeGroup` component that renders multiple nodes from data

4. Render hardcoded test data (5-6 nodes) positioned in 3D space to verify the aesthetic

5. Nodes should respect the color scheme from PLANNING.md:
   - Cyan (#00ffff) — default/compute
   - Orange (#ff9900) — AWS services
   - Magenta (#ff4f8b) — integration/events
   - Blue (#3b48cc) — database

### Non-Functional Requirements

- Maintain 60fps with 10+ nodes on screen
- Clean component separation (one node = one component instance)
- Props-driven (no hardcoded values inside Node3D)

## Technical Approach

Use React Three Fiber's declarative approach:
- `useFrame` for animations (rings rotation, bobbing)
- `useRef` to access mesh for animations
- Group multiple meshes (core, glow, rings) under one `<group>`
- Position passed to group, internal elements positioned relative

## Dependencies

No new packages required. Uses existing:
- `@react-three/fiber` (useFrame, Canvas)
- `@react-three/drei` (already installed)
- `three` (geometries, materials)

## Data Structure

Follow the schema from PLANNING.md:

```javascript
// Test data for this INITIAL
const testNodes = [
  { id: 'lambda1', label: 'Lambda', position: [-4, 0, 0], color: '#ff9900' },
  { id: 'api-gw', label: 'API Gateway', position: [-8, 0, 0], color: '#ff9900' },
  { id: 'dynamodb', label: 'DynamoDB', position: [0, 0, 0], color: '#3b48cc' },
  { id: 'eventbridge', label: 'EventBridge', position: [4, 0, 2], color: '#ff4f8b' },
  { id: 's3', label: 'S3 Bucket', position: [4, 0, -2], color: '#00ffff' },
];
```

## Component Structure

```
src/components/canvas/
├── Node3D.jsx        # Single node with glow + rings
├── NodeGroup.jsx     # Renders array of nodes
└── TestBox.jsx       # (existing, can remove or keep for reference)
```

## Visual Reference

From POC (`reference/poc-visualization.jsx`):
- Core: `IcosahedronGeometry(0.5, 2)` with `MeshBasicMaterial`, opacity 0.9
- Glow: `IcosahedronGeometry(0.7, 2)` with `BackSide`, opacity 0.2
- Rings: `TorusGeometry(0.8, 0.02, 8, 32)` — thin wireframe torus
- Two rings at different rotations (one flat, one angled 45°)

## Acceptance Criteria

- [ ] Node3D component renders a glowing icosahedron with two rings
- [ ] Rings rotate continuously (visible animation)
- [ ] Nodes have subtle up/down bobbing motion
- [ ] NodeGroup renders 5+ test nodes at different positions
- [ ] Each node displays in its specified color
- [ ] Scene maintains 60fps (check with React DevTools or frame counter)
- [ ] Components are reusable (props for position, color, id)

## Out of Scope

- Node labels/text (future INITIAL)
- Click selection (future INITIAL)
- Drag to reposition (future INITIAL)
- Edge connections (initial-03)
- Post-processing bloom (initial-05 or later)

## Notes

- Keep TestBox.jsx for now as a reference, or remove if scene feels cluttered
- Consider adding a simple grid helper if not already present (helps visualize 3D space)
- The POC has ambient "dust" particles — that's a separate enhancement, not this INITIAL
