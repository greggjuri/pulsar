# PRP: 14 - Bloom Post-Processing

> Generated from: `INITIAL/initial-14-bloom-post-processing.md`
> Generated on: 2025-12-24
> Confidence: 9/10

## Summary

Add bloom post-processing effects to create authentic sci-fi holographic glow. This is the first Phase 5 (Polish) feature and will dramatically enhance the visual aesthetic by making nodes and edge particles appear to emit light.

## Requirements Addressed

1. **Basic Bloom Effect** - Apply bloom post-processing to the 3D scene
2. **Sci-Fi Aesthetic** - Subtle but noticeable bloom focused on cyan and accent colors
3. **Performance Conscious** - Maintain 60fps target
4. **Selective Bloom** - Bright emissive elements bloom, dark backgrounds stay dark

## Technical Approach

### Architecture

- **New package**: Install `@react-three/postprocessing`
- **New component**: `PostProcessing.jsx` wraps EffectComposer with Bloom
- **Integration**: Add PostProcessing inside Canvas after scene content
- **No material changes needed**: Current `meshBasicMaterial` with bright colors will bloom naturally

### Key Configuration

```jsx
<Bloom
  intensity={0.5}           // Glow strength
  luminanceThreshold={0.2}  // Lower for more bloom on our colors
  luminanceSmoothing={0.9}  // Smooth transition
  mipmapBlur={true}         // Better quality blur
  radius={0.4}              // Blur spread
/>
```

### Why meshBasicMaterial Works

Our nodes use `meshBasicMaterial` with bright colors like `#00ffff`. These are inherently bright (high luminance) and will trigger bloom. No need to switch to emissive materials.

## Implementation Steps

### Step 1: Install @react-three/postprocessing
**Files:** `package.json`

**Changes:**
- [ ] Run `npm install @react-three/postprocessing`

**Validation:**
- [ ] Package installs without errors
- [ ] No peer dependency conflicts

### Step 2: Create PostProcessing Component
**Files:** `src/components/canvas/PostProcessing.jsx` (NEW)

**Changes:**
- [ ] Create component that wraps EffectComposer
- [ ] Add Bloom effect with tuned parameters
- [ ] Export for use in App.jsx

**Validation:**
- [ ] Component renders without errors
- [ ] No console warnings

### Step 3: Integrate PostProcessing in App.jsx
**Files:** `src/App.jsx` (MODIFY)

**Changes:**
- [ ] Import PostProcessing component
- [ ] Add PostProcessing after SceneContent inside Canvas
- [ ] Wrap in Suspense if needed for shader loading

**Validation:**
- [ ] App loads without errors
- [ ] Bloom effect visible on nodes

### Step 4: Fine-Tune Bloom Parameters
**Files:** `src/components/canvas/PostProcessing.jsx` (MODIFY)

**Changes:**
- [ ] Adjust intensity (0.4-0.6 range)
- [ ] Adjust luminanceThreshold (0.2-0.4)
- [ ] Adjust radius (0.3-0.5)
- [ ] Test with different node colors

**Validation:**
- [ ] Nodes have visible glow halo
- [ ] Edge particles bloom subtly
- [ ] Grid stays relatively unaffected
- [ ] Background remains dark
- [ ] Selected nodes appear brighter

### Step 5: Performance Verification
**Files:** N/A (testing)

**Changes:**
- [ ] Test FPS with browser dev tools
- [ ] Test with 10+ nodes
- [ ] Verify smooth animations

**Validation:**
- [ ] Maintains ~60fps on modern browsers
- [ ] No significant frame drops during interaction

### Step 6: Update Documentation
**Files:** `docs/TASK.md` (MODIFY)

**Changes:**
- [ ] Mark PRP-14 as complete
- [ ] Add session notes
- [ ] Note Phase 5 (Polish) has begun
- [ ] Commit and push

**Validation:**
- [ ] Documentation updated, changes committed

## Dependencies

**New package to install:**
- `@react-three/postprocessing` - React Three Fiber wrapper for postprocessing effects

**Existing dependencies used:**
- `@react-three/fiber` - React Three Fiber for 3D rendering
- `three` - Three.js core library

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | Client-side only | $0.00 |

**Free Tier Eligible:** Yes (no AWS services)

## Testing Strategy

- [ ] Nodes glow with visible light bleed
- [ ] Cyan, orange, magenta, and other colors bloom appropriately
- [ ] Edge particles have subtle bloom
- [ ] Grid remains mostly unaffected
- [ ] Background stays dark (no wash-out)
- [ ] Selected nodes have enhanced glow
- [ ] Performance maintains ~60fps
- [ ] Works across different zoom levels
- [ ] No visual artifacts or glitches

## Rollback Plan

If issues arise:
1. Remove PostProcessing component from App.jsx
2. Delete PostProcessing.jsx
3. Uninstall @react-three/postprocessing: `npm uninstall @react-three/postprocessing`

Simple rollback as bloom is an additive effect with no code dependencies.

## Open Questions

1. **Bloom toggle** - Deferring user toggle to keep implementation simple. Can add later if performance issues reported.
2. **Starting intensity** - Will start at 0.5 and tune based on visual testing.
3. **Selected node enhancement** - Current brightness boost should be visible through bloom naturally; no additional changes needed.

