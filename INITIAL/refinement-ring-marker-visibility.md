# Refinement: Ring & Marker Visibility Fix

> Follow-up to PRP-14a
> Type: Visual fix / refinement
> Scope: `src/components/canvas/Node3D.jsx`

## Problem

After PRP-14a, we made rings uniformly cyan which created visual noise — edges and rings looked identical, making the scene too busy. Additionally, cyan markers still disappear against cyan nodes.

## Solution

1. **Revert rings** to their original color logic (darker shade of node color)
2. **Special case cyan node rings** → use magenta for contrast
3. **Markers default to cyan** with bloom (matches edge particles aesthetic)
4. **Special case cyan node markers** → use white for contrast

## Implementation

### Step 1: Revert Ring Material

Change ring material back to original style (non-emissive, darker shade):

```jsx
// Ring material - revert to original
<meshBasicMaterial 
  color={ringColor}  // Use existing ringColor logic
  transparent 
  opacity={0.6} 
/>
```

### Step 2: Add Cyan Node Ring Color Override

Where ring color is determined, add special case for cyan nodes:

```jsx
// If node color is cyan, use magenta ring instead
const isCyanNode = color === '#00ffff' || color?.toLowerCase() === '#00ffff';
const effectiveRingColor = isCyanNode ? '#ff4f8b' : ringColor;
```

### Step 3: Update Marker Material

Change markers to cyan with bloom, except for cyan nodes which get white:

```jsx
// Determine marker color - cyan unless node is cyan
const markerColor = isCyanNode ? '#ffffff' : '#00ffff';

// Marker mesh with bloom
<mesh position={[markerRadius, 0, 0]}>
  <sphereGeometry args={[0.06, 8, 8]} />
  <meshStandardMaterial
    color={markerColor}
    emissive={markerColor}
    emissiveIntensity={2.0}
    toneMapped={false}
  />
</mesh>
```

### Step 4: Apply to Both Ring Orbits

Make sure both orbital rings (horizontal and tilted) use the same logic for:
- Ring color (with cyan override)
- Marker color (cyan default, white for cyan nodes)

## Expected Result

| Node Color | Ring Color | Marker Color |
|------------|------------|--------------|
| White | Gray (original) | Cyan ✅ |
| Yellow/Orange | Darker orange (original) | Cyan ✅ |
| Blue | Darker blue (original) | Cyan ✅ |
| Pink | Darker pink (original) | Cyan ✅ |
| Green | Darker green (original) | Cyan ✅ |
| **Cyan** | **Magenta** | **White** ✅ |

## Validation

- [ ] White node: gray ring visible, cyan markers visible
- [ ] Yellow node: orange ring visible, cyan markers visible  
- [ ] Blue node: blue ring visible, cyan markers visible
- [ ] Pink node: pink ring visible, cyan markers visible
- [ ] Green node: green ring visible, cyan markers visible
- [ ] Cyan node: magenta ring visible, white markers visible
- [ ] Markers have subtle bloom effect
- [ ] Scene no longer looks overly busy with cyan everywhere
- [ ] Rings are distinguishable from edge paths

## Rollback

If issues, revert Node3D.jsx to previous commit.
