# PRP: 07 - Camera Controls

> Generated from: `INITIAL/initial-07-camera-controls.md`
> Generated on: 2025-12-24
> Confidence: 9/10

## Summary

Add "Zoom to Fit" and "Reset View" camera control functions to complete Phase 2 interactivity. Both functions animate smoothly and are accessible via HUD buttons and keyboard shortcuts (F for fit, R/Home for reset).

## Requirements Addressed

1. Zoom to Fit - frames all nodes with padding, maintains viewing angle, animates smoothly
2. Reset View - returns camera to default position/target, animates smoothly
3. HUD buttons for both actions with tooltips
4. Keyboard shortcuts: F (fit), R/Home (reset)
5. Smooth animation (~500ms with ease-out)

## Technical Approach

### Architecture

- **Store-driven actions**: Add `cameraAction` state to graphStore to trigger camera movements
- **SceneControls expansion**: Handle camera animations inside Canvas context using refs and useFrame
- **Manual lerp animation**: Use frame-by-frame interpolation (no new dependencies)
- **OrbitControls ref**: Need ref access to update both camera position and controls target

### Key Components

1. `src/utils/camera.js` - Bounding box calculation and camera math
2. `src/stores/graphStore.js` - Add camera action state
3. `src/components/canvas/CameraController.jsx` - New component for animation logic
4. `src/components/hud/ViewControlsPanel.jsx` - New HUD buttons
5. `src/App.jsx` - Extend keyboard handler

## Implementation Steps

### Step 1: Create Camera Utility Functions
**Files:** `src/utils/camera.js` (NEW)

**Changes:**
- [ ] Create `calculateBounds(nodes)` - returns `{ center, radius }` using Three.js Box3/Sphere
- [ ] Create `calculateFitPosition(camera, bounds, padding)` - returns target position for fit
- [ ] Export constants: `DEFAULT_CAMERA_POSITION`, `DEFAULT_CAMERA_TARGET`, `CAMERA_LERP_SPEED`, `FIT_PADDING`

**Validation:**
- [ ] Import works without errors
- [ ] calculateBounds returns correct center for test nodes

### Step 2: Extend graphStore with Camera Actions
**Files:** `src/stores/graphStore.js` (MODIFY)

**Changes:**
- [ ] Add `cameraAction: null` state (values: `'fit'`, `'reset'`, `null`)
- [ ] Add `triggerFit: () => set({ cameraAction: 'fit' })`
- [ ] Add `triggerReset: () => set({ cameraAction: 'reset' })`
- [ ] Add `clearCameraAction: () => set({ cameraAction: null })`

**Validation:**
- [ ] Store updates correctly when actions are triggered
- [ ] Actions clear properly

### Step 3: Create CameraController Component
**Files:** `src/components/canvas/CameraController.jsx` (NEW)

**Changes:**
- [ ] Create component that renders inside Canvas
- [ ] Get refs to camera and OrbitControls using useThree and useRef
- [ ] Watch `cameraAction` from store
- [ ] Implement lerp-based animation in useFrame
- [ ] Track animation state with refs: `targetPosition`, `targetTarget`, `isAnimating`
- [ ] Handle fit: calculate bounds, compute target position/target
- [ ] Handle reset: use default position/target
- [ ] Clear action after animation starts
- [ ] Stop animation if user interacts with OrbitControls

**Validation:**
- [ ] Fit action moves camera to frame all nodes
- [ ] Reset action returns camera to default position
- [ ] Animations are smooth (~500ms)
- [ ] OrbitControls work after animation completes

### Step 4: Integrate CameraController into App
**Files:** `src/App.jsx` (MODIFY)

**Changes:**
- [ ] Import CameraController
- [ ] Add CameraController inside Canvas (alongside SceneControls)
- [ ] Pass OrbitControls ref from SceneControls to CameraController (or combine them)

**Validation:**
- [ ] Camera animations work when triggered

### Step 5: Create ViewControlsPanel HUD Component
**Files:** `src/components/hud/ViewControlsPanel.jsx` (NEW)

**Changes:**
- [ ] Create panel with two icon buttons (Fit and Reset)
- [ ] Style matching existing HUD (bg-black/50, border-cyan-500/30, etc.)
- [ ] Import and call `triggerFit` / `triggerReset` from store
- [ ] Add hover states and tooltips
- [ ] Icons: `⊞` for fit, `↺` for reset (or similar Unicode)

**Validation:**
- [ ] Buttons render below ControlsPanel
- [ ] Hover states work
- [ ] Tooltips appear on hover

### Step 6: Add ViewControlsPanel to HudOverlay
**Files:** `src/components/hud/HudOverlay.jsx` (MODIFY)

**Changes:**
- [ ] Import ViewControlsPanel
- [ ] Add ViewControlsPanel to the overlay

**Validation:**
- [ ] ViewControlsPanel visible in HUD
- [ ] Clicking buttons triggers camera actions

### Step 7: Add Keyboard Shortcuts
**Files:** `src/App.jsx` (MODIFY)

**Changes:**
- [ ] Import `triggerFit` and `triggerReset` from store
- [ ] Extend handleKeyDown to check for 'f'/'F' (fit) and 'r'/'R'/'Home' (reset)
- [ ] Add check to ignore shortcuts when typing in an input (future-proofing)

**Validation:**
- [ ] Pressing F triggers zoom to fit
- [ ] Pressing R or Home triggers reset view
- [ ] Escape still clears selection

### Step 8: Handle Edge Cases
**Files:** `src/utils/camera.js`, `src/components/canvas/CameraController.jsx` (MODIFY)

**Changes:**
- [ ] Handle no nodes: fit does nothing or resets
- [ ] Handle single node: use minimum distance
- [ ] Handle all nodes at same position (radius = 0): use minimum radius
- [ ] Handle animation interruption: stop animation when OrbitControls detects interaction
- [ ] Ignore fit/reset while dragging a node

**Validation:**
- [ ] No crashes with 0, 1, or overlapping nodes
- [ ] User can interrupt animation by rotating/zooming

### Step 9: Update Documentation
**Files:** `docs/TASK.md`, `src/components/hud/ControlsPanel.jsx` (MODIFY)

**Changes:**
- [ ] Update TASK.md with PRP-07 completion status
- [ ] Add keyboard shortcuts to ControlsPanel hints (F = fit, R = reset)

**Validation:**
- [ ] Documentation reflects new features

## Dependencies

**No new packages required.**

Uses existing:
- Three.js `Box3`, `Sphere`, `Vector3`
- @react-three/fiber `useThree`, `useFrame`
- @react-three/drei `OrbitControls`
- Zustand for state

## Testing Strategy

- [ ] Manual test: Click Fit with various node configurations (0, 1, 5, many)
- [ ] Manual test: Click Reset from different camera positions
- [ ] Manual test: Keyboard shortcuts F and R work
- [ ] Manual test: Animation is smooth and takes ~500ms
- [ ] Manual test: Can orbit/zoom immediately after animation
- [ ] Manual test: Interrupt animation mid-flight with mouse drag
- [ ] Manual test: Fit/Reset while dragging node is ignored

## Rollback Plan

If issues arise:
1. Remove CameraController from App.jsx
2. Remove ViewControlsPanel from HudOverlay
3. Remove camera actions from graphStore
4. Delete new files: CameraController.jsx, ViewControlsPanel.jsx, camera.js

## Open Questions

None - the INITIAL spec is comprehensive and provides clear implementation guidance.

## Constants Reference

```javascript
// src/utils/camera.js
export const DEFAULT_CAMERA_POSITION = [0, 8, 15]; // Match App.jsx initial
export const DEFAULT_CAMERA_TARGET = [0, 0, 0];
export const CAMERA_LERP_SPEED = 0.08; // ~500ms to complete
export const FIT_PADDING = 1.5; // Breathing room multiplier
export const MIN_FIT_DISTANCE = 5; // Minimum distance for single/no nodes
```
