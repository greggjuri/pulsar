# INITIAL: 07 - Camera Controls

> **File:** `initial-07-camera-controls.md`  
> **Generates:** `prp-07-camera-controls.md`

## Summary

Add camera control functions to complete Phase 2 interactivity: "Zoom to Fit" frames all nodes in view, and "Reset View" returns the camera to its default position. Both are accessible via HUD buttons and keyboard shortcuts.

## Requirements

### Functional Requirements

**1. Zoom to Fit**

- Calculates bounding box/sphere of all nodes
- Moves camera to frame all nodes with padding
- Maintains current viewing angle (direction), just adjusts distance
- Animates smoothly to new position (not instant snap)
- Keyboard shortcut: `F`

**2. Reset View**

- Returns camera to default position and target
- Default position: `[12, 8, 12]` (or current initial values from App.jsx)
- Default target: `[0, 0, 0]` (origin)
- Animates smoothly to default
- Keyboard shortcut: `Home` or `R`

**3. HUD Buttons**

Add a ViewControlsPanel (or extend ControlsPanel) with two buttons:
- `⊞` or `[ ]` — Zoom to Fit (tooltip: "Fit all nodes in view (F)")
- `⌂` or `↺` — Reset View (tooltip: "Reset camera (Home)")

Position: Top-right area, near existing ControlsPanel or integrated into it.

**4. Animation**

- Camera movement should be smooth, not instant
- Duration: ~500ms (fast but visible)
- Easing: ease-out for natural deceleration
- OrbitControls target should also animate if it changes

### Non-Functional Requirements

- Works correctly regardless of current camera position/zoom
- Works with any number of nodes (1 to many)
- Doesn't interfere with OrbitControls or node dragging
- Keyboard shortcuts work when canvas is focused

## Technical Approach

### Bounding Box Calculation

```javascript
import { Box3, Vector3, Sphere } from 'three';

const calculateBounds = (nodes) => {
  if (nodes.length === 0) return null;
  
  const box = new Box3();
  nodes.forEach(node => {
    box.expandByPoint(new Vector3(...node.position));
  });
  
  const center = new Vector3();
  const sphere = new Sphere();
  box.getBoundingSphere(sphere);
  box.getCenter(center);
  
  return { center, radius: sphere.radius };
};
```

### Camera Positioning for Fit

```javascript
const zoomToFit = (camera, controls, bounds, padding = 1.5) => {
  const { center, radius } = bounds;
  
  // Calculate distance needed to fit sphere in view
  const fov = camera.fov * (Math.PI / 180);
  const distance = (radius * padding) / Math.sin(fov / 2);
  
  // Get current camera direction (normalized)
  const direction = new Vector3();
  camera.getWorldDirection(direction);
  direction.negate(); // Point away from target
  
  // New camera position: center + direction * distance
  const newPosition = center.clone().add(direction.multiplyScalar(distance));
  
  // Animate to new position
  animateCamera(camera, controls, newPosition, center);
};
```

### Animation Options

**Option A: Manual animation with useFrame**
```javascript
// Store target values, lerp in useFrame
const targetPosition = useRef(null);
const targetTarget = useRef(null);

useFrame(() => {
  if (targetPosition.current) {
    camera.position.lerp(targetPosition.current, 0.1);
    controls.target.lerp(targetTarget.current, 0.1);
    controls.update();
    
    if (camera.position.distanceTo(targetPosition.current) < 0.01) {
      targetPosition.current = null;
    }
  }
});
```

**Option B: Use a tweening library (gsap, @react-spring/three)**
- Cleaner but adds dependency

**Recommendation:** Start with Option A (manual lerp). Simple, no new dependencies, good enough for MVP.

### Store Integration

Add to `graphStore` or create new `cameraStore`:
```javascript
// Could add to graphStore for simplicity
cameraAction: null, // 'fit' | 'reset' | null
triggerFit: () => set({ cameraAction: 'fit' }),
triggerReset: () => set({ cameraAction: 'reset' }),
clearCameraAction: () => set({ cameraAction: null }),
```

Scene component watches `cameraAction` and executes the corresponding function.

### Keyboard Handling

Extend existing Escape key listener in App.jsx:
```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') clearSelection();
    if (e.key === 'f' || e.key === 'F') triggerFit();
    if (e.key === 'Home' || e.key === 'r' || e.key === 'R') triggerReset();
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

Note: May need to check that no input is focused to avoid triggering on typing.

## Component Structure

```
src/
├── stores/
│   └── graphStore.js           # MODIFY: Add camera action state
├── components/
│   ├── canvas/
│   │   └── SceneControls.jsx   # MODIFY: Add camera animation logic
│   └── hud/
│       ├── HudOverlay.jsx      # MODIFY: Add ViewControlsPanel
│       └── ViewControlsPanel.jsx # NEW: Fit/Reset buttons
├── utils/
│   └── camera.js               # NEW: Bounding calc, zoom math
```

## Constants

```javascript
// Default camera state (match initial App.jsx values)
export const DEFAULT_CAMERA_POSITION = [12, 8, 12];
export const DEFAULT_CAMERA_TARGET = [0, 0, 0];

// Animation
export const CAMERA_ANIMATION_SPEED = 0.1; // Lerp factor per frame

// Zoom to fit
export const FIT_PADDING = 1.5; // Multiplier for breathing room
```

## Props / API Changes

**graphStore.js** — Add:
- `cameraAction: 'fit' | 'reset' | null`
- `triggerFit: () => void`
- `triggerReset: () => void`
- `clearCameraAction: () => void`

**SceneControls.jsx** — Add:
- Watch `cameraAction` from store
- Execute fit/reset logic when triggered
- Clear action after animation starts

**ViewControlsPanel.jsx** — New component:
- Two icon buttons for Fit and Reset
- Calls `triggerFit()` / `triggerReset()`

## Acceptance Criteria

- [ ] `triggerFit` and `triggerReset` actions added to store
- [ ] "Zoom to Fit" button in HUD
- [ ] "Reset View" button in HUD
- [ ] Clicking Fit button frames all nodes with padding
- [ ] Clicking Reset button returns camera to default position
- [ ] Camera movement is animated (smooth, ~500ms)
- [ ] Pressing `F` triggers zoom to fit
- [ ] Pressing `Home` or `R` triggers reset view
- [ ] Works correctly with 1 node, 5 nodes, many nodes
- [ ] Works from any camera angle/zoom level
- [ ] OrbitControls still work after animation completes
- [ ] Doesn't conflict with node dragging
- [ ] Buttons have hover states and tooltips

## Edge Cases

1. **No nodes** — Fit should do nothing or reset to default (no crash)
2. **Single node** — Fit should zoom to reasonable distance from that node
3. **All nodes at same position** — Should handle gracefully (radius = 0)
4. **Camera animation interrupted by user input** — OrbitControls interaction should cancel animation
5. **Fit triggered while dragging** — Should be ignored or queued

## Out of Scope

- Save/restore custom camera positions
- Named camera presets
- Smooth follow selected node
- First-person or fly camera modes
- Camera collision with nodes
- Minimap with camera viewport indicator

## Dependencies

No new packages required. Uses:
- Three.js `Box3`, `Sphere`, `Vector3`
- Existing OrbitControls ref access

## Visual Reference

**Button styling** (matches existing HUD):
```jsx
<button className="bg-black/50 border border-cyan-500/30 rounded p-2 
                   hover:bg-cyan-500/20 hover:border-cyan-500/50 
                   transition-colors text-cyan-400">
  <span className="text-lg">⊞</span>
</button>
```

**Button placement:**
- Below ControlsPanel, or
- Integrated as icon row at bottom of ControlsPanel

**Icons:**
- Fit: `⊞` or `◻` or `[ ]` or custom SVG
- Reset: `⌂` or `↺` or `⟲` or custom SVG

---

**Ready for handoff to Claude Code** — Once approved, generate PRP with `/generate-prp`.
