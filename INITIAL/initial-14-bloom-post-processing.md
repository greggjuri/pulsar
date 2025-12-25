# INITIAL-14: Bloom Post-Processing

## Overview

Add bloom post-processing effects to dramatically enhance the sci-fi aesthetic. Bloom creates the characteristic "glow" seen in sci-fi interfaces like Iron Man's JARVIS and Minority Report, making bright elements appear to emit light.

## User Story

As a user, I want the visualization to have a sci-fi glow effect so that nodes and edges appear to emit light, creating an immersive holographic aesthetic.

## Background

Currently, our nodes have emissive materials and outer glow sprites, but they don't truly "bloom" into the surrounding darkness. Real bloom post-processing samples bright pixels and bleeds them outward, creating the authentic light-emission effect seen in movies.

### Why This Matters

Bloom is the single biggest visual upgrade we can make to achieve the sci-fi aesthetic:
- Transforms flat emissive colors into apparent light sources
- Makes the cyan/magenta/orange accents pop dramatically
- Creates the "holographic projection" feel
- Unifies the visual language (everything that glows, blooms)

## Requirements

### Functional Requirements

1. **FR-1: Basic Bloom Effect**
   - Apply bloom post-processing to the 3D scene
   - Bright emissive materials (nodes, particles) should bloom
   - Dark backgrounds should remain dark (selective bloom)

2. **FR-2: Tuned for Sci-Fi Aesthetic**
   - Bloom should be subtle but noticeable
   - Primary focus on cyan (`#00ffff`) and other accent colors
   - Should not wash out the entire scene

3. **FR-3: Performance Conscious**
   - Maintain 60fps target
   - Bloom resolution may be reduced for performance
   - Consider device capability detection (optional)

4. **FR-4: User Toggle (Nice-to-have)**
   - Optional: Allow users to disable bloom for performance
   - If implemented, add to settings/controls panel

### Non-Functional Requirements

1. **NFR-1: Minimal Bundle Impact**
   - Use @react-three/postprocessing (already in PLANNING.md tech stack)
   - Avoid adding new heavy dependencies

2. **NFR-2: Visual Consistency**
   - Bloom should enhance, not change, existing color palette
   - Selected nodes should bloom more intensely
   - Particles should bloom appropriately

## Technical Approach

### Recommended Implementation

Use `@react-three/postprocessing` with `EffectComposer` and `Bloom` effect:

```jsx
import { EffectComposer, Bloom } from '@react-three/postprocessing'

// Inside Canvas
<EffectComposer>
  <Bloom 
    intensity={0.5}       // Glow intensity
    luminanceThreshold={0.4}  // Only bloom bright areas
    luminanceSmoothing={0.9}  // Smooth transition
    mipmapBlur={true}     // Better quality blur
  />
</EffectComposer>
```

### Parameters to Tune

| Parameter | Description | Starting Value | Notes |
|-----------|-------------|----------------|-------|
| `intensity` | Overall bloom strength | 0.5 | Increase for more dramatic effect |
| `luminanceThreshold` | Brightness cutoff | 0.4 | Lower = more blooms |
| `luminanceSmoothing` | Transition smoothness | 0.9 | Higher = softer edge |
| `mipmapBlur` | Blur quality | true | Better quality, slightly more GPU |
| `radius` | Blur radius | 0.4 | Larger = more spread |

### Selective Bloom Approach

To control what blooms:
- **Nodes**: Already use emissive materials - these will naturally bloom
- **Edges**: Particles use additive blending - should bloom nicely
- **HUD**: HTML overlay, not affected by 3D post-processing
- **Grid**: Non-emissive, won't bloom (good - keeps it subtle)

### Material Adjustments (if needed)

May need to increase emissive intensity on materials for proper bloom:
```jsx
<meshStandardMaterial 
  color={color}
  emissive={color}
  emissiveIntensity={1.5}  // Might need adjustment
/>
```

## Acceptance Criteria

1. [ ] Bloom effect is applied to the 3D scene
2. [ ] Nodes glow with visible light bleed into surrounding area
3. [ ] Edge particles have subtle bloom effect
4. [ ] Grid remains relatively unaffected (not blooming)
5. [ ] Background stays dark (no overall wash-out)
6. [ ] Selected nodes have enhanced glow (brightness boost visible through bloom)
7. [ ] Performance maintains ~60fps on modern browsers
8. [ ] Effect enhances sci-fi aesthetic without being overwhelming

## Out of Scope

- Chromatic aberration effects (future enhancement)
- Scanline/CRT effects (future enhancement)  
- Per-node bloom toggle
- Mobile performance optimization (future)
- User-adjustable bloom settings (nice-to-have, defer if complex)

## Dependencies

- `@react-three/postprocessing` package (needs to be installed)
- Existing Node3D, Edge3D components (may need material tweaks)

## Testing Strategy

1. **Visual Testing**
   - Compare before/after screenshots
   - Test with multiple node colors (cyan, orange, magenta)
   - Test with various zoom levels
   - Check edge particle bloom

2. **Performance Testing**
   - Monitor FPS with React DevTools / browser performance tab
   - Test with 10+ nodes and edges
   - Verify no significant frame drops

3. **Compatibility Testing**
   - Test in Chrome, Firefox, Safari
   - Test on different screen sizes

## Implementation Notes

### Installation
```bash
npm install @react-three/postprocessing
```

### File Structure
```
src/
  components/
    three/
      PostProcessing.jsx    # New - EffectComposer wrapper
  App.jsx                   # Add PostProcessing inside Canvas
```

### Integration Points
- Add `<PostProcessing />` inside `<Canvas>` after scene content
- May need to wrap in `<Suspense>` if it loads shaders asynchronously
- Position after all scene content, before closing `</Canvas>`

## Visual Reference

Think Iron Man's JARVIS interface - cyan holograms glowing against dark backgrounds, with light bleeding softly into the surrounding space. The effect should be:
- **Subtle**: Not overwhelming or distracting
- **Focused**: Bloom emanates from designed bright points
- **Atmospheric**: Creates depth and ambiance
- **Sci-Fi**: Immediately evokes "futuristic technology"

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | Frontend-only feature | $0.00 |

**Total: $0.00** - No AWS services involved.

## Questions for Review

1. Should we include a bloom toggle in the UI from the start?
2. Any specific bloom intensity preferences to start with?
3. Should selected nodes have increased emissive intensity for more dramatic selection highlight?

---

**Author:** Claude.ai (Planning)  
**For:** Claude Code (Implementation)  
**Phase:** 5 - Polish  
**Priority:** High (first Phase 5 feature)
