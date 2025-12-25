# INITIAL-14a: Node Material Enhancement for Bloom

## Overview

Follow-up fix to PRP-14 (Bloom Post-Processing). While bloom dramatically improved edges and particles, most node colors (orange, blue, pink, green) remain visually flat because they don't hit the luminance threshold. This spec enhances node materials to emit light properly for consistent bloom across all node colors.

## Problem

After implementing bloom:
- ✅ White nodes bloom beautifully
- ✅ Cyan nodes have decent glow
- ✅ Edge particles look amazing
- ❌ Orange nodes appear flat
- ❌ Blue nodes appear flat  
- ❌ Pink/Magenta nodes appear flat
- ❌ Green nodes appear flat

**Root cause:** Bloom triggers on luminance (perceived brightness). Saturated colors like orange (#ff9900) and blue (#3b82f6) have lower luminance than white/cyan, so they don't exceed the bloom threshold.

## Solution

Switch node core material from `meshBasicMaterial` to `meshStandardMaterial` with emissive properties. This makes nodes "emit light" of their color, which bloom will pick up regardless of the color's natural luminance.

## Requirements

### Functional Requirements

1. **FR-1: Emissive Node Cores**
   - All node colors should bloom visibly
   - Bloom intensity should be consistent across colors
   - White/cyan should not over-bloom

2. **FR-2: Maintain Visual Hierarchy**
   - Selected nodes should still appear brighter
   - Node cores should remain the visual anchor (not washed out)

3. **FR-3: Preserve Existing Aesthetics**
   - Orbital rings should remain as-is (they look good)
   - Outer glow halos may need adjustment

### Non-Functional Requirements

1. **NFR-1: Performance**
   - No significant FPS impact from material change
   - `meshStandardMaterial` is slightly more expensive but negligible for node count

## Technical Approach

### Current Implementation (Node3D.jsx)
```jsx
// Core sphere - currently meshBasicMaterial
<mesh>
  <icosahedronGeometry args={[0.5, 1]} />
  <meshBasicMaterial color={color} />
</mesh>
```

### Proposed Implementation
```jsx
// Core sphere - emissive for bloom
<mesh>
  <icosahedronGeometry args={[0.5, 1]} />
  <meshStandardMaterial 
    color={color}
    emissive={color}
    emissiveIntensity={1.5}
    toneMapped={false}
  />
</mesh>
```

### Key Properties

| Property | Value | Purpose |
|----------|-------|---------|
| `color` | node color | Base color (for non-bloomed view) |
| `emissive` | node color | Color of emitted light |
| `emissiveIntensity` | 1.5 | Strength of emission (tune 1.0-2.5) |
| `toneMapped` | false | Allow HDR values to exceed 1.0 for bloom |

### Selection State Enhancement

For selected nodes, increase emissive intensity:
```jsx
emissiveIntensity={isSelected ? 2.5 : 1.5}
```

### Outer Glow Halo Consideration

The existing sprite-based outer glow may now be redundant or need opacity reduction since bloom creates natural glow. Options:
1. Keep as-is (layered glow effect)
2. Reduce opacity (e.g., 0.15 → 0.08)
3. Remove entirely (bloom handles it)

**Recommendation:** Start by keeping it, evaluate visually, reduce if too intense.

## Acceptance Criteria

1. [ ] All node colors (cyan, orange, blue, pink, green, white) have visible bloom halo
2. [ ] Bloom intensity is visually balanced across colors (no single color dominates)
3. [ ] Selected nodes have enhanced bloom (noticeably brighter)
4. [ ] Node cores remain solid and readable (not washed out)
5. [ ] Orbital rings unaffected
6. [ ] No performance regression
7. [ ] Edge bloom remains at current level (not affected by node changes)

## Out of Scope

- Adjusting bloom post-processing parameters (those are good)
- Ring material changes
- Edge particle changes
- Per-node bloom toggle

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/canvas/Node3D.jsx` | Update core material to meshStandardMaterial with emissive |

## Testing Strategy

1. **Visual Testing**
   - Screenshot each node color with bloom
   - Compare bloom intensity across colors
   - Test selected vs unselected states
   - Test at various zoom levels

2. **Performance Testing**
   - Verify 60fps maintained
   - Test with 10+ nodes

## Implementation Notes

### Tuning Guide

If bloom is too strong:
- Reduce `emissiveIntensity` (try 1.0)
- Reduce outer glow sprite opacity

If bloom is too weak:
- Increase `emissiveIntensity` (try 2.0-2.5)
- Ensure `toneMapped={false}` is set

If white nodes over-bloom:
- Consider color-specific intensity OR
- Clamp white to off-white (#f0f0f0)

### Lighting Consideration

`meshStandardMaterial` responds to scene lighting. Current scene should have ambient light. If nodes appear dark, may need to add:
```jsx
<ambientLight intensity={0.5} />
```

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | Frontend-only fix | $0.00 |

**Total: $0.00**

## Estimated Effort

**Small** - Single file change, ~15 minutes implementation + tuning

---

**Type:** Hotfix / Enhancement  
**Parent:** PRP-14 (Bloom Post-Processing)  
**Phase:** 5 - Polish  
**Priority:** High (visual polish incomplete without this)
