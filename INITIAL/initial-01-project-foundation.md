# INITIAL: 01 - Project Foundation

> **File:** `initial-01-project-foundation.md`
> **Generates:** `prp-01-project-foundation.md`

## Summary
Set up the base project structure with Vite, React, Three.js, and core dependencies. Establish folder structure and verify everything works with a minimal 3D scene.

## Requirements

### Functional Requirements
1. Create new Vite project with React template
2. Install and configure all core dependencies
3. Set up folder structure per CLAUDE.md conventions
4. Create minimal App component that renders a 3D canvas
5. Verify Three.js rendering works with a simple rotating cube
6. Add Tailwind CSS for UI styling
7. Add basic HUD overlay to confirm 2D + 3D layering works

### Non-Functional Requirements
- Dev server starts without errors
- Hot reload works for both React and Three.js changes
- Build completes successfully
- No TypeScript errors (if using TS)

## Dependencies to Install

### Production
```json
{
  "three": "^0.160.0",
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.92.0",
  "zustand": "^4.4.0"
}
```

### Development
```json
{
  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0"
}
```

### Optional (can add in later PRPs)
```json
{
  "@react-three/postprocessing": "^2.16.0",
  "leva": "^0.9.35"
}
```

## Folder Structure to Create

```
src/
├── components/
│   ├── canvas/
│   │   └── .gitkeep
│   ├── hud/
│   │   └── .gitkeep
│   └── shared/
│       └── .gitkeep
├── stores/
│   └── .gitkeep
├── hooks/
│   └── .gitkeep
├── utils/
│   └── .gitkeep
├── data/
│   └── .gitkeep
├── types/
│   └── .gitkeep
├── assets/
│   └── .gitkeep
├── App.jsx
├── main.jsx
└── index.css
```

## Acceptance Criteria

- [ ] `npm run dev` starts server on localhost
- [ ] Browser shows a rotating 3D cube on dark background
- [ ] HUD text overlay is visible on top of 3D scene
- [ ] No console errors
- [ ] `npm run build` succeeds
- [ ] Folder structure matches specification
- [ ] All dependencies installed and importable

## Reference Code

A proof-of-concept exists in the Claude.ai chat that can be referenced for the visual style (aws-3d-viz.jsx). However, this PRP focuses only on foundation setup - the full visualization comes in later PRPs.

### Minimal Test Scene (for verification)
```jsx
// App.jsx - minimal test
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function Box() {
  return (
    <mesh rotation={[0.5, 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="cyan" wireframe />
    </mesh>
  );
}

function App() {
  return (
    <div className="w-full h-screen bg-gray-950 relative">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Box />
        <OrbitControls />
      </Canvas>
      
      {/* HUD Overlay Test */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono">
        SYSTEM ONLINE
      </div>
    </div>
  );
}

export default App;
```

## Out of Scope
- Full node/edge rendering (PRP-02, PRP-03)
- State management implementation (PRP-later)
- Post-processing effects (PRP-later)
- Any actual AWS visualization

## Notes
- Keep it minimal - this is just proving the stack works
- TypeScript can be added progressively, start with JSX if faster
- Make sure Tailwind is working before moving on
