# PRP: 14a - Node Material Enhancement for Bloom

> Generated from: `INITIAL/initial-14a-node-material-enhancement.md`
> Generated on: 2025-12-24
> Confidence: 9/10

## Summary

Follow-up enhancement to PRP-14 (Bloom Post-Processing). Switch node core material from `meshBasicMaterial` to `meshStandardMaterial` with emissive properties so all node colors (orange, blue, pink, green) bloom properly, not just high-luminance colors like white and cyan.

## Requirements Addressed

1. **Emissive Node Cores** - All node colors should bloom visibly with consistent intensity
2. **Visual Hierarchy** - Selected nodes should have enhanced bloom (brighter glow)
3. **Preserve Aesthetics** - Orbital rings and existing look remain intact
4. **Performance** - No significant FPS impact from material change

## Technical Approach

### Current Problem

Bloom triggers on luminance (perceived brightness). Saturated colors like orange (#ff9900) and blue (#3b82f6) have lower luminance than white/cyan, so they don't exceed the bloom threshold of 0.2.

### Solution

Change the node core material from `meshBasicMaterial` to `meshStandardMaterial` with emissive properties:

```jsx
<meshStandardMaterial
  color={displayColor}
  emissive={displayColor}
  emissiveIntensity={isSelected ? 2.5 : 1.5}
  toneMapped={false}
/>
```

### Key Properties

| Property | Value | Purpose |
|----------|-------|---------|
| `color` | node color | Base color (for non-bloomed view) |
| `emissive` | node color | Color of emitted light for bloom |
| `emissiveIntensity` | 1.5 (2.5 selected) | Strength of emission |
| `toneMapped` | false | Allow HDR values >1.0 for bloom pickup |

### Scope

- **Modify**: Core sphere material only (lines 216-219)
- **Keep as-is**: Orbital rings, glow halo, selection ring, marker spheres

## Implementation Steps

### Step 1: Update Node Core Material
**Files:** `src/components/canvas/Node3D.jsx` (MODIFY)

**Changes:**
- [ ] Change core mesh material from `meshBasicMaterial` to `meshStandardMaterial`
- [ ] Add `emissive={displayColor}` property
- [ ] Add `emissiveIntensity` with selection-aware value (1.5 normal, 2.5 selected)
- [ ] Add `toneMapped={false}` to allow HDR values

**Validation:**
- [ ] All node colors (cyan, orange, blue, pink, green, white) have visible bloom
- [ ] Selected nodes have enhanced glow
- [ ] No console errors

### Step 2: Visual Tuning (if needed)
**Files:** `src/components/canvas/Node3D.jsx` (MODIFY)

**Changes:**
- [ ] Adjust `emissiveIntensity` if bloom too strong/weak (range 1.0-2.5)
- [ ] Reduce outer glow opacity if bloom makes it redundant (optional)

**Validation:**
- [ ] Bloom intensity balanced across all colors
- [ ] Node cores remain solid and readable (not washed out)
- [ ] White nodes don't over-bloom

### Step 3: Update Documentation
**Files:** `docs/TASK.md` (MODIFY)

**Changes:**
- [ ] Mark PRP-14a as complete
- [ ] Add session notes
- [ ] Commit and push

**Validation:**
- [ ] Documentation updated, changes committed

## Dependencies

**No new packages required.**

**Existing dependencies used:**
- Scene already has `ambientLight` and `pointLight` (required for meshStandardMaterial)
- Bloom post-processing already configured (PRP-14)

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | Client-side only | $0.00 |

**Free Tier Eligible:** Yes (no AWS services)

## Testing Strategy

- [ ] All node colors bloom visibly (cyan, orange, blue, pink, green, white)
- [ ] Bloom intensity is balanced across colors (no single color dominates)
- [ ] Selected nodes have enhanced bloom (noticeably brighter)
- [ ] Node cores remain solid and readable
- [ ] Orbital rings unaffected (still look good)
- [ ] Edge bloom unchanged
- [ ] Performance maintains ~60fps

## Rollback Plan

If issues arise:
1. Revert the material change back to `meshBasicMaterial`
2. Remove `emissive`, `emissiveIntensity`, `toneMapped` properties

Simple single-file rollback.

## Open Questions

None - the INITIAL spec is clear and the implementation is straightforward.

## Tuning Guide (from INITIAL)

**If bloom is too strong:**
- Reduce `emissiveIntensity` (try 1.0)
- Reduce outer glow sprite opacity

**If bloom is too weak:**
- Increase `emissiveIntensity` (try 2.0-2.5)
- Ensure `toneMapped={false}` is set

**If white nodes over-bloom:**
- Consider color-specific intensity OR
- Clamp white to off-white (#f0f0f0)
