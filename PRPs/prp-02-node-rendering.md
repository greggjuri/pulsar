# PRP: 02 - Node Rendering

> Generated from: `INITIAL/initial-02-node-rendering.md`
> Generated on: 2024-12-23
> Confidence: 9/10

## Summary

Create the core 3D node component with sci-fi holographic aesthetic. Each node features a glowing icosahedron core, outer glow halo, two animated rotating rings, and subtle bobbing motion. Implement a NodeGroup component to render multiple nodes from data, and display hardcoded test nodes to verify the visual style.

## Requirements Addressed

From INITIAL spec:
- [x] Create Node3D component with icosahedron core, glow sphere, and rotating rings
- [x] Implement ring rotation animations at different speeds
- [x] Implement subtle vertical bobbing motion (sine wave)
- [x] Create NodeGroup component to render multiple nodes from data
- [x] Render 5 hardcoded test nodes positioned in 3D space
- [x] Support configurable colors via props
- [x] Maintain 60fps with 10+ nodes

## Technical Approach

1. **Node3D Component**: Use React Three Fiber's declarative approach with a `<group>` containing:
   - Core: `<icosahedronGeometry>` with `MeshBasicMaterial` (opacity 0.9)
   - Glow: Larger `<icosahedronGeometry>` with `BackSide` rendering (opacity 0.2)
   - Ring 1: `<torusGeometry>` flat horizontal (rotates on Z axis)
   - Ring 2: `<torusGeometry>` angled 45° (rotates on Z axis at different speed)

2. **Animations via useFrame**:
   - Rings: Continuous Z rotation at different speeds per ring
   - Bobbing: Sine wave applied to group Y position using `state.clock.elapsedTime`
   - Each node gets a unique offset to prevent synchronized bobbing

3. **NodeGroup Component**: Maps over node data array, renders Node3D for each with appropriate props.

4. **Test Data**: Hardcoded array following PLANNING.md schema, placed in `src/data/testNodes.js`.

## Implementation Steps

### Step 1: Create Test Node Data

**Files:** `src/data/testNodes.js` (create)
**Changes:**
- [ ] Create test nodes array with 5 nodes following PLANNING.md schema
- [ ] Include positions spread across 3D space
- [ ] Use specified color scheme (orange for AWS, cyan for default, etc.)

**Code:**
```javascript
export const testNodes = [
  { id: 'api-gw', label: 'API Gateway', position: [-6, 0, 0], color: '#ff9900' },
  { id: 'lambda1', label: 'Lambda', position: [-2, 0, 0], color: '#ff9900' },
  { id: 'dynamodb', label: 'DynamoDB', position: [2, 0, 0], color: '#3b48cc' },
  { id: 'eventbridge', label: 'EventBridge', position: [6, 0, 2], color: '#ff4f8b' },
  { id: 's3', label: 'S3 Bucket', position: [6, 0, -2], color: '#00ffff' },
];
```

**Validation:**
- [ ] File exists and exports testNodes array
- [ ] Array has 5 nodes with id, label, position, color

---

### Step 2: Create Node3D Component

**Files:** `src/components/canvas/Node3D.jsx` (create)
**Changes:**
- [ ] Create Node3D component accepting props: `id`, `position`, `color`, `index`
- [ ] Render group with core icosahedron, glow sphere, and two rings
- [ ] Use `useRef` for group and rings to enable animations
- [ ] Implement `useFrame` for ring rotation and bobbing

**Component Structure:**
```jsx
<group position={position} ref={groupRef}>
  {/* Core */}
  <mesh>
    <icosahedronGeometry args={[0.5, 2]} />
    <meshBasicMaterial color={color} transparent opacity={0.9} />
  </mesh>

  {/* Glow */}
  <mesh>
    <icosahedronGeometry args={[0.7, 2]} />
    <meshBasicMaterial color={color} transparent opacity={0.2} side={BackSide} />
  </mesh>

  {/* Ring 1 - horizontal */}
  <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
    <torusGeometry args={[0.8, 0.02, 8, 32]} />
    <meshBasicMaterial color={color} transparent opacity={0.6} />
  </mesh>

  {/* Ring 2 - angled */}
  <mesh ref={ring2Ref} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
    <torusGeometry args={[0.8, 0.02, 8, 32]} />
    <meshBasicMaterial color={color} transparent opacity={0.6} />
  </mesh>
</group>
```

**Animation Logic:**
```javascript
useFrame((state, delta) => {
  const time = state.clock.elapsedTime;

  // Ring rotation (delta-based for frame-rate independence)
  if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.5;
  if (ring2Ref.current) ring2Ref.current.rotation.z += delta * 0.75;

  // Bobbing (offset by index to desync)
  if (groupRef.current) {
    const baseY = position[1];
    groupRef.current.position.y = baseY + Math.sin(time * 2 + index) * 0.1;
  }
});
```

**Validation:**
- [ ] Node3D renders without errors
- [ ] Glowing icosahedron core visible
- [ ] Outer glow halo visible (semi-transparent)
- [ ] Two rings visible at different angles
- [ ] Rings rotate continuously
- [ ] Node bobs up and down subtly

---

### Step 3: Create NodeGroup Component

**Files:** `src/components/canvas/NodeGroup.jsx` (create)
**Changes:**
- [ ] Create NodeGroup component accepting `nodes` array prop
- [ ] Map over nodes array, render Node3D for each
- [ ] Pass index to each Node3D for bobbing offset

**Code:**
```jsx
import Node3D from './Node3D';

const NodeGroup = ({ nodes }) => {
  return (
    <group>
      {nodes.map((node, index) => (
        <Node3D
          key={node.id}
          id={node.id}
          position={node.position}
          color={node.color}
          index={index}
        />
      ))}
    </group>
  );
};

export default NodeGroup;
```

**Validation:**
- [ ] NodeGroup renders without errors
- [ ] Renders correct number of Node3D components
- [ ] Each node positioned correctly

---

### Step 4: Update App.jsx to Use NodeGroup

**Files:** `src/App.jsx` (modify)
**Changes:**
- [ ] Import NodeGroup and testNodes
- [ ] Replace TestBox with NodeGroup
- [ ] Adjust camera position for better view of multiple nodes (pull back)
- [ ] Optionally add GridHelper for spatial reference

**Code:**
```jsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import NodeGroup from './components/canvas/NodeGroup';
import { testNodes } from './data/testNodes';

function App() {
  return (
    <div className="w-full h-screen bg-gray-950 relative">
      <Canvas camera={{ position: [0, 8, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <NodeGroup nodes={testNodes} />
        <Grid
          infiniteGrid
          cellSize={1}
          cellThickness={0.5}
          cellColor="#1a3a3a"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#0d4a4a"
          fadeDistance={30}
          fadeStrength={1}
        />
        <OrbitControls />
      </Canvas>

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono">
        <div className="text-2xl font-bold tracking-wider" style={{ textShadow: '0 0 10px cyan' }}>
          PULSAR
        </div>
        <div className="text-sm opacity-60 mt-1">SYSTEM ONLINE</div>
      </div>
    </div>
  );
}

export default App;
```

**Validation:**
- [ ] App renders without errors
- [ ] 5 test nodes visible in scene
- [ ] Nodes are positioned at different locations
- [ ] Each node has its specified color
- [ ] Grid visible below nodes
- [ ] OrbitControls still work

---

### Step 5: Remove or Keep TestBox

**Files:** `src/components/canvas/TestBox.jsx`
**Changes:**
- [ ] Keep file for reference (no deletion)
- [ ] Remove import from App.jsx (already done in Step 4)

**Validation:**
- [ ] No references to TestBox in App.jsx
- [ ] App runs without TestBox

---

### Step 6: Verify Performance

**Manual Testing:**
- [ ] Open browser DevTools → Performance tab
- [ ] Run profiler while scene is animating
- [ ] Verify frame rate stays at/near 60fps
- [ ] Check for any frame drops or jank

**Validation:**
- [ ] Scene maintains 60fps with 5 nodes
- [ ] No console warnings about performance
- [ ] Animations are smooth (no stutter)

---

## Dependencies

### New Packages to Install
None required.

### Existing Code Dependencies
| Package | Usage |
|---------|-------|
| @react-three/fiber | useFrame, Canvas |
| @react-three/drei | OrbitControls, Grid |
| three | BackSide constant |

## Cost Estimate

**No AWS services involved in this PRP.** This is purely frontend 3D rendering.

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | - | $0.00 |

## Testing Strategy

- [ ] **Visual Test**: 5 glowing nodes visible with different colors
- [ ] **Animation Test**: Rings rotate, nodes bob up and down
- [ ] **Color Test**: Each node matches its specified color
- [ ] **Position Test**: Nodes spread across scene (not overlapping)
- [ ] **Performance Test**: 60fps maintained (browser DevTools)
- [ ] **Controls Test**: OrbitControls still function with nodes

## Rollback Plan

1. Revert App.jsx to use TestBox instead of NodeGroup
2. Delete new files: `Node3D.jsx`, `NodeGroup.jsx`, `testNodes.js`
3. Run `npm run dev` to verify rollback works

## Open Questions

None — the INITIAL spec is clear with specific geometries, colors, and animation behavior. The POC provides exact values to replicate.

## Files Changed Summary

| Action | Path |
|--------|------|
| Create | `src/data/testNodes.js` |
| Create | `src/components/canvas/Node3D.jsx` |
| Create | `src/components/canvas/NodeGroup.jsx` |
| Modify | `src/App.jsx` |
| Keep | `src/components/canvas/TestBox.jsx` (reference only) |

---

## Confidence Assessment: 9/10

**Reasoning:**
- **Clear visual reference**: POC code provides exact geometry args and material settings
- **Well-defined data structure**: PLANNING.md schema matches INITIAL spec
- **Simple animation patterns**: useFrame with clock.elapsedTime is standard R3F pattern
- **No new dependencies**: Uses existing @react-three packages
- **Minor deduction**: First time implementing BackSide in R3F declaratively (trivial import from 'three')

**Ready for execution** with `/execute-prp PRPs/prp-02-node-rendering.md`
