# CLAUDE.md - Project Intelligence

## Project Overview

**Name:** Pulsar
**Purpose:** Interactive 3D visualization tool for AWS architecture diagrams with a sci-fi holographic aesthetic
**Tech Stack:** React, Three.js, Vite

## Code Style & Conventions

### General
- Use functional React components with hooks
- Prefer composition over inheritance
- Keep components focused and single-purpose
- Use TypeScript for new files (migrate progressively)

### File Naming
- Components: `PascalCase.jsx` or `PascalCase.tsx`
- Utilities: `camelCase.js`
- Stores: `camelCase.store.js`
- Constants: `SCREAMING_SNAKE_CASE` for values, `camelCase.js` for files

### Directory Structure
```
pulsar/
├── src/                  # Frontend React app
│   ├── components/       # React components
│   │   ├── canvas/       # 3D scene components (Three.js)
│   │   ├── hud/          # 2D overlay UI components
│   │   └── shared/       # Reusable UI primitives
│   ├── stores/           # Zustand state management
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   ├── api/              # API client functions
│   ├── data/             # Static data, schemas, presets
│   ├── types/            # TypeScript type definitions
│   └── assets/           # Icons, textures, fonts
├── infra/                # AWS CDK infrastructure
│   ├── lib/              # CDK stacks
│   └── bin/              # CDK app entry
├── docs/                 # Project documentation
├── INITIAL/              # Feature specifications
└── PRPs/                 # Implementation plans
```

### Three.js Conventions
- Wrap Three.js objects in React components using @react-three/fiber
- Use `useFrame` for animations, not `requestAnimationFrame`
- Dispose of geometries and materials on unmount
- Keep 3D logic separate from UI logic

### State Management
- Use Zustand for global state (graph data, selection, camera)
- Use React state for component-local UI state
- Keep 3D scene state minimal - derive from Zustand store

## Key Patterns

### Node/Edge Data Model
```javascript
// Node
{
  id: string,
  type: 'lambda' | 'dynamodb' | 'apigateway' | ...,
  label: string,
  position: [x, y, z],
  metadata: { ... }
}

// Edge
{
  id: string,
  from: nodeId,
  to: nodeId,
  animated: boolean,
  style: 'solid' | 'dashed'
}
```

### Component Template
```jsx
const MyComponent = ({ prop1, prop2 }) => {
  // hooks first
  const store = useGraphStore();
  const [local, setLocal] = useState(null);
  
  // effects
  useEffect(() => { ... }, []);
  
  // handlers
  const handleClick = () => { ... };
  
  // render
  return ( ... );
};

export default MyComponent;
```

## Commands Reference

### Development
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
```

### Custom Slash Commands (Claude Code)
- `/generate-prp <initial-file>` - Generate PRP from INITIAL spec
- `/execute-prp <prp-file>` - Execute implementation plan
- `/status` - Show current task status

### File Naming Conventions
- **INITIAL specs:** `initial-##-feature-name.md` (e.g., `initial-01-project-foundation.md`)
- **PRPs:** `prp-##-feature-name.md` (e.g., `prp-01-project-foundation.md`)
- Sequential numbering must be maintained
- Numbers should be zero-padded (01, 02, ... 10, 11)

## Important Notes

### ⚠️ Cost Awareness — CRITICAL
- **Every AWS service addition requires cost estimate in INITIAL spec**
- Prefer free tier eligible services
- No NAT Gateway, RDS, ECS, or expensive services without explicit approval
- Use serverless (Lambda, DynamoDB, S3) — they scale to zero
- Check PLANNING.md "Cost Management" section before proposing AWS services
- When in doubt, ask about cost implications first

### Performance
- Keep draw calls minimal, use instancing for repeated geometries

### Accessibility
- Ensure HUD elements have proper contrast and are keyboard navigable

### Mobile
- Touch controls are a stretch goal, not MVP

### Testing
- Focus on utility functions first, E2E for critical paths

## File Reading Priority

When starting any task, read in this order:
1. This file (CLAUDE.md)
2. docs/PLANNING.md (architecture context)
3. docs/TASK.md (current status)
4. Relevant INITIAL or PRP file
5. docs/DECISIONS.md (if architecture questions arise)
