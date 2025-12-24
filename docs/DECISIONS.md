# DECISIONS.md - Architectural Decision Log

## How to Use This File

Each decision follows this format:
```
## [DECISION-XXX] Title
**Date:** YYYY-MM-DD
**Status:** Accepted | Superseded | Deprecated
**Context:** Why we needed to make this decision
**Decision:** What we decided
**Consequences:** What this means going forward
**Alternatives Considered:** What else we looked at
```

---

## [DECISION-001] Use React Three Fiber over raw Three.js

**Date:** 2024-12-21
**Status:** Accepted

**Context:**
We need to render 3D graphics in the browser. Raw Three.js gives full control but requires imperative code that doesn't fit well with React's declarative model. We're already using React for the UI.

**Decision:**
Use @react-three/fiber as the primary 3D rendering abstraction, with @react-three/drei for common helpers (orbit controls, etc.).

**Consequences:**
- Components can be written declaratively
- State flows naturally from React/Zustand to 3D scene
- Some advanced Three.js patterns may need workarounds
- Team needs to learn R3F patterns, not just raw Three.js

**Alternatives Considered:**
- Raw Three.js: More control, but imperative code mixed with React
- Babylon.js: Good alternative, but Three.js has larger ecosystem
- PlayCanvas: More game-focused, overkill for our needs

---

## [DECISION-002] Zustand for State Management

**Date:** 2024-12-21
**Status:** Accepted

**Context:**
Need global state for: graph data (nodes/edges), selection state, camera position, UI mode. Options range from React Context to Redux to simpler solutions.

**Decision:**
Use Zustand for all global state management.

**Consequences:**
- Minimal boilerplate
- Easy to access from both React components and Three.js objects
- No provider wrapper needed
- Less structure than Redux (could be pro or con)

**Alternatives Considered:**
- Redux Toolkit: Too much ceremony for our needs
- React Context: Performance concerns with frequent updates
- Jotai: Good but less familiar, smaller ecosystem
- MobX: More magic, steeper learning curve

---

## [DECISION-003] Vite as Build Tool

**Date:** 2024-12-21
**Status:** Accepted

**Context:**
Need a modern build tool for React + TypeScript development. Create React App is deprecated/unmaintained.

**Decision:**
Use Vite with the React + TypeScript template.

**Consequences:**
- Fast HMR during development
- Modern ESM-first approach
- Good plugin ecosystem
- Need to configure some things CRA did automatically

**Alternatives Considered:**
- Create React App: Deprecated, slow
- Next.js: Overkill, we don't need SSR
- Parcel: Good but less popular, fewer resources

---

## [DECISION-004] Client-Side First Architecture

**Date:** 2024-12-21
**Status:** Accepted

**Context:**
Deciding whether to build a backend from day one or start client-only.

**Decision:**
Start with fully client-side application. Use localStorage for persistence. Backend/cloud sync can be added later.

**Consequences:**
- Faster initial development
- Works offline by default
- No infrastructure costs initially
- Will need migration path when adding backend
- No collaboration features until backend exists

**Alternatives Considered:**
- Firebase: Easy but vendor lock-in
- Custom backend from start: Slower to MVP
- Supabase: Good option for later

---

## [DECISION-005] Sci-Fi Aesthetic as Core Identity

**Date:** 2024-12-21
**Status:** Accepted

**Context:**
Many architecture diagram tools exist (draw.io, Lucidchart, Cloudcraft). We need differentiation.

**Decision:**
Make the sci-fi holographic aesthetic a core feature, not just a theme. This includes: glow effects, particle animations, HUD-style UI, dark color scheme with cyan/magenta accents.

**Consequences:**
- Clear visual differentiation from competitors
- May limit appeal to users wanting "professional" look
- Performance budget needed for effects
- Will add "professional" themes later as option

**Alternatives Considered:**
- Clean minimal style: Less differentiated
- Customizable themes from start: More work, dilutes identity
- Cloudcraft-style isometric: Already done well by others

---

## [DECISION-006] Project Name: Pulsar

**Date:** 2024-12-21
**Status:** Accepted

**Context:**
Needed a memorable, sci-fi themed name that reflects the project's visual identity and purpose.

**Decision:**
Name the project "Pulsar" — a rotating neutron star that emits beams of light.

**Consequences:**
- Fits the animated, glowing aesthetic perfectly
- Short, memorable, easy to spell
- Available as a project/repo name
- Can use pulsar imagery in branding (rotating beams, pulses)

**Alternatives Considered:**
- Nexus: Good but very common
- Stratos: Cloud-related but less distinctive
- Archon: Powerful but less approachable
- Holograph: Descriptive but generic

---

## [DECISION-007] Host on AWS at pulsar.jurigregg.com

**Date:** 2024-12-21
**Status:** Accepted

**Context:**
Need to decide on hosting infrastructure. User already has jurigregg.com running on AWS with Route53, EC2, S3, CloudFront, DynamoDB, and Cognito.

**Decision:**
Host Pulsar as a subdomain `pulsar.jurigregg.com` using existing AWS infrastructure:
- Route53 for DNS
- CloudFront + S3 for static hosting
- API Gateway + Lambda for backend API
- DynamoDB for diagram metadata
- S3 for diagram storage
- Cognito for authentication

**Consequences:**
- Can build full-featured app with auth and persistence from start
- Leverages existing infrastructure knowledge
- Cost-effective (serverless scales to zero)
- Will need CDK setup for infrastructure as code
- Backend features can be phased in after MVP

**Alternatives Considered:**
- Vercel/Netlify: Simpler but less control, would need separate backend
- Client-side only: Faster MVP but limited features
- Firebase: Good option but already invested in AWS

---

## [DECISION-008] Strict Cost Management Policy

**Date:** 2024-12-21
**Status:** Accepted

**Context:**
AWS costs can spiral unexpectedly. Personal project needs to stay within budget with no surprises.

**Decision:**
Implement strict cost management practices:
1. Every INITIAL spec with AWS services must include cost estimate
2. AWS Budget alerts at $5/mo, hard investigation at $10/mo
3. Prefer serverless (Lambda, DynamoDB, S3) that scales to zero
4. No NAT Gateway, RDS, ECS, or other expensive services without explicit approval
5. Stay within free tier limits where possible
6. Monthly cost review required

**Consequences:**
- Slower to add new AWS services (need cost analysis first)
- Architecture constrained to cost-effective options
- No surprise bills
- May need to refactor if free tier exceeded
- All resources must be tagged for cost allocation

**Alternatives Considered:**
- No restrictions: Risk of surprise bills
- Fixed monthly budget: Too rigid, doesn't account for growth
- Pay-as-you-go without monitoring: Dangerous

---

## [DECISION-009] Use Tailwind CSS v4 with Vite Plugin

**Date:** 2024-12-23
**Status:** Accepted

**Context:**
Setting up the project foundation required choosing a Tailwind CSS version. The INITIAL spec referenced v3.4.0, but Tailwind v4 was recently released with a fundamentally different configuration approach (CSS-first vs JavaScript config file).

**Decision:**
Use Tailwind CSS v4 with the `@tailwindcss/vite` plugin instead of v3.

**Consequences:**
- Simpler setup: No `tailwind.config.js` or `postcss.config.js` files needed
- CSS-first configuration aligns better with modern CSS practices
- Native CSS variables for theming (useful for sci-fi glow effects)
- Future-proof: No v3→v4 migration needed later
- Fewer dependencies: 1 package (`@tailwindcss/vite`) vs 3 (`tailwindcss`, `autoprefixer`, `postcss`)
- Some Tailwind v3 tutorials/plugins may not apply directly

**Alternatives Considered:**
- Tailwind v3.4.0: More tutorials available, but would require migration eventually
- No CSS framework: More work for utility classes, less consistent

---

## [DECISION-010] Delta-Based Animations in useFrame

**Date:** 2024-12-23
**Status:** Accepted

**Context:**
When implementing 3D animations with React Three Fiber's `useFrame` hook, we need to choose between fixed increments (`rotation += 0.01`) or delta-based increments (`rotation += delta * speed`).

**Decision:**
Use delta-based animations for all continuous motion (rotation, movement) in useFrame callbacks.

**Consequences:**
- Animations are frame-rate independent (consistent on 60Hz, 120Hz, 144Hz displays)
- Code pattern: `ref.current.rotation.z += delta * speed` where speed is the desired radians/second
- Slightly more verbose but more correct
- Time-based animations (sine waves using `clock.elapsedTime`) are already frame-rate independent

**Alternatives Considered:**
- Fixed increments (`+= 0.01`): Simpler but speed varies with refresh rate
- Separate animation library: Overkill for simple rotations

---

## [DECISION-011] Zustand Store Pattern with Selectors

**Date:** 2024-12-23
**Status:** Accepted

**Context:**
With the implementation of node selection (PRP-05), we established the first Zustand store for shared state between 3D canvas and 2D HUD components. We needed to decide on the access pattern for store state.

**Decision:**
Use individual selectors for each piece of state to prevent unnecessary re-renders:

```javascript
// Good: Component only re-renders when selectedNodeId changes
const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
const selectNode = useGraphStore((s) => s.selectNode);

// Avoid: Component re-renders on ANY store change
const { selectedNodeId, selectNode } = useGraphStore();
```

**Consequences:**
- Better performance: components only re-render when their specific slice of state changes
- More verbose: multiple selector calls vs one destructuring
- Pattern should be followed for all future store usage
- Store can grow without impacting component performance

**Alternatives Considered:**
- Full store destructuring: Simpler but causes unnecessary re-renders
- React.memo everywhere: More complexity, band-aid solution
- Separate stores per concern: Premature optimization, may complicate cross-store access

---

## Template for New Decisions

```
## [DECISION-XXX] Title

**Date:** YYYY-MM-DD
**Status:** Accepted

**Context:**
[Why we needed to make this decision]

**Decision:**
[What we decided]

**Consequences:**
[What this means going forward]

**Alternatives Considered:**
[What else we looked at]
```
