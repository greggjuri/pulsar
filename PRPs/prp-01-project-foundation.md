# PRP: 01 - Project Foundation

> Generated from: `INITIAL/initial-01-project-foundation.md`
> Generated on: 2024-12-23
> Confidence: 9/10

## Summary

Set up the foundational project structure for Pulsar using Vite, React, and Three.js. This includes installing all core dependencies, establishing the folder structure per CLAUDE.md conventions, configuring Tailwind CSS v4 (with CSS-first configuration), and verifying the stack works with a minimal 3D scene and HUD overlay.

## Requirements Addressed

From INITIAL spec:
- [x] Create new Vite project with React template
- [x] Install and configure all core dependencies
- [x] Set up folder structure per CLAUDE.md conventions
- [x] Create minimal App component that renders a 3D canvas
- [x] Verify Three.js rendering works with a simple rotating cube
- [x] Add Tailwind CSS for UI styling
- [x] Add basic HUD overlay to confirm 2D + 3D layering works

Non-functional:
- [x] Dev server starts without errors
- [x] Hot reload works for both React and Three.js changes
- [x] Build completes successfully

## Technical Approach

1. **Project Initialization**: Create a new Vite project with the React template. We'll start with JavaScript (JSX) as specified in the INITIAL notes, with TypeScript available for progressive adoption.

2. **Dependency Installation**: Install the core Three.js ecosystem (@react-three/fiber, @react-three/drei) along with Zustand for state management. Tailwind CSS will be configured for styling.

3. **Folder Structure**: Create the full directory structure as specified in CLAUDE.md with `.gitkeep` files to ensure empty directories are tracked by git.

4. **Minimal Scene**: Create a test scene with a rotating wireframe cube using @react-three/fiber's declarative approach, with OrbitControls from @react-three/drei.

5. **HUD Overlay**: Add a simple positioned div with sci-fi styling (cyan text, monospace font) to verify 2D elements layer correctly over the 3D canvas.

6. **Verification**: Run dev server, test hot reload, and verify production build works.

## Implementation Steps

### Step 1: Initialize Vite Project

**Files:** Create new project structure
**Changes:**
- [ ] Run `npm create vite@latest . -- --template react` to initialize in current directory
- [ ] Verify initial project structure is created

**Validation:**
- [ ] `package.json` exists with Vite and React dependencies
- [ ] `npm run dev` starts successfully (initial template)

---

### Step 2: Install Core Dependencies

**Files:** `package.json`
**Changes:**
- [ ] Install production dependencies:
  - `three@^0.160.0`
  - `@react-three/fiber@^8.15.0`
  - `@react-three/drei@^9.92.0`
  - `zustand@^4.4.0`
- [ ] Install development dependencies:
  - `@tailwindcss/vite@^4.0.0` (Tailwind v4 Vite plugin)

**Commands:**
```bash
npm install three @react-three/fiber @react-three/drei zustand
npm install -D @tailwindcss/vite
```

> **Note:** Using Tailwind v4 with the Vite plugin. This uses CSS-first configuration (no `tailwind.config.js` needed) and integrates directly with Vite.

**Validation:**
- [ ] All packages listed in `package.json`
- [ ] `node_modules` contains installed packages
- [ ] No peer dependency warnings

---

### Step 3: Configure Tailwind CSS v4

**Files:**
- `vite.config.js` (modify)
- `src/index.css` (modify)

**Changes:**
- [ ] Add `@tailwindcss/vite` plugin to Vite config
- [ ] Update `src/index.css` with Tailwind v4 import

**Configuration (vite.config.js):**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

**Configuration (src/index.css):**
```css
@import "tailwindcss";
```

> **Tailwind v4 notes:**
> - No `tailwind.config.js` needed - uses CSS-first configuration
> - No `postcss.config.js` needed - Vite plugin handles it
> - Custom theme values can be added via CSS variables in `index.css` if needed later

**Validation:**
- [ ] Tailwind classes work in components
- [ ] No build errors related to CSS

---

### Step 4: Create Folder Structure

**Files:** Create directories and `.gitkeep` files
**Changes:**
- [ ] Create `src/components/canvas/.gitkeep`
- [ ] Create `src/components/hud/.gitkeep`
- [ ] Create `src/components/shared/.gitkeep`
- [ ] Create `src/stores/.gitkeep`
- [ ] Create `src/hooks/.gitkeep`
- [ ] Create `src/utils/.gitkeep`
- [ ] Create `src/data/.gitkeep`
- [ ] Create `src/types/.gitkeep`
- [ ] Create `src/assets/.gitkeep`

**Validation:**
- [ ] All directories exist
- [ ] `git status` shows new directories tracked

---

### Step 5: Create Minimal 3D Scene

**Files:**
- `src/App.jsx` (replace)
- `src/components/canvas/TestBox.jsx` (create)

**Changes:**
- [ ] Create `TestBox` component with rotating wireframe cube
- [ ] Replace `App.jsx` with Canvas setup, lighting, and OrbitControls
- [ ] Add useFrame hook for rotation animation

**TestBox Component (src/components/canvas/TestBox.jsx):**
```jsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const TestBox = () => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="cyan" wireframe />
    </mesh>
  );
};

export default TestBox;
```

**App Component (src/App.jsx):**
```jsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import TestBox from './components/canvas/TestBox';

function App() {
  return (
    <div className="w-full h-screen bg-gray-950 relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <TestBox />
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
- [ ] 3D cube renders on screen
- [ ] Cube rotates continuously
- [ ] OrbitControls allow camera manipulation (drag to rotate, scroll to zoom)

---

### Step 6: Add HUD Overlay Styling

**Files:** `src/App.jsx` (already included in Step 5)

**Changes:**
- [ ] HUD overlay already added in App.jsx with:
  - Absolute positioning (top-left corner)
  - Cyan color (#22d3ee equivalent via Tailwind)
  - Monospace font
  - Text shadow glow effect

**Validation:**
- [ ] HUD text visible on top of 3D scene
- [ ] Text has sci-fi glow effect
- [ ] HUD doesn't interfere with 3D controls

---

### Step 7: Clean Up Vite Defaults

**Files:**
- `src/App.css` (delete)
- `src/assets/react.svg` (delete if exists)
- `public/vite.svg` (keep or replace later)

**Changes:**
- [ ] Remove default Vite/React CSS file
- [ ] Remove unused assets
- [ ] Update `index.html` title to "Pulsar"

**Validation:**
- [ ] No console errors about missing files
- [ ] Clean project structure

---

### Step 8: Verify Full Stack

**Commands:**
```bash
npm run dev     # Start dev server
npm run build   # Production build
npm run preview # Preview production build
```

**Validation:**
- [ ] Dev server starts without errors
- [ ] Hot reload works when modifying:
  - App.jsx (component change)
  - TestBox.jsx (3D scene change)
  - Tailwind classes
- [ ] `npm run build` completes without errors
- [ ] `npm run preview` serves production build correctly
- [ ] No console errors in browser

---

## Dependencies

### New Packages to Install
| Package | Version | Purpose |
|---------|---------|---------|
| three | ^0.160.0 | 3D rendering engine |
| @react-three/fiber | ^8.15.0 | React renderer for Three.js |
| @react-three/drei | ^9.92.0 | Useful helpers (OrbitControls, etc.) |
| zustand | ^4.4.0 | State management |
| @tailwindcss/vite | ^4.0.0 | Tailwind v4 Vite plugin (CSS-first config) |

### Existing Code Dependencies
- None (fresh project)

## Cost Estimate

**No AWS services involved in this PRP.** This is a purely frontend setup.

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | - | $0.00 |

**Free Tier Eligible:** N/A

## Testing Strategy

- [ ] **Visual Test**: Rotating cyan wireframe cube visible on dark background
- [ ] **Controls Test**: OrbitControls work (drag to rotate, scroll to zoom)
- [ ] **HUD Test**: "PULSAR" text visible with glow effect in top-left
- [ ] **Build Test**: `npm run build` succeeds without errors
- [ ] **Console Test**: No errors or warnings in browser console

## Rollback Plan

Since this is the initial project setup:
1. If something goes wrong, delete `node_modules`, `package-lock.json`
2. Re-run `npm install`
3. If still broken, `git reset --hard` to return to empty project state
4. Re-attempt with corrected steps

## Open Questions

None - the INITIAL spec is clear and straightforward. This is a standard Vite + React + Three.js setup following well-documented patterns.

## Files Changed Summary

| Action | Path |
|--------|------|
| Create | `package.json` (via Vite init, then modified) |
| Modify | `vite.config.js` (add Tailwind v4 plugin) |
| Create | `index.html` (via Vite, modify title) |
| Create | `src/main.jsx` |
| Modify | `src/App.jsx` |
| Modify | `src/index.css` |
| Delete | `src/App.css` |
| Create | `src/components/canvas/TestBox.jsx` |
| Create | `src/components/canvas/.gitkeep` |
| Create | `src/components/hud/.gitkeep` |
| Create | `src/components/shared/.gitkeep` |
| Create | `src/stores/.gitkeep` |
| Create | `src/hooks/.gitkeep` |
| Create | `src/utils/.gitkeep` |
| Create | `src/data/.gitkeep` |
| Create | `src/types/.gitkeep` |
| Create | `src/assets/.gitkeep` |

---

## Confidence Assessment: 9/10

**Reasoning:**
- **Clear requirements**: The INITIAL spec is well-defined with specific dependencies and code examples
- **Standard patterns**: This is a common Vite + React + Three.js setup with extensive documentation
- **Reference available**: POC code in `reference/poc-visualization.jsx` provides visual style guidance
- **No ambiguity**: Folder structure and dependencies are explicitly specified
- **Tailwind v4**: Using newer v4 with CSS-first config (simpler setup, future-proof for this greenfield project)
- **Minor deduction**: Slight uncertainty about exact package versions compatibility (minor semver differences possible)

**Ready for execution** with `/execute-prp PRPs/prp-01-project-foundation.md`
