# PLANNING.md - Architecture Overview

## Vision

Create a beautiful, interactive 3D visualization tool for cloud architecture diagrams. The aesthetic is inspired by sci-fi movie interfaces (Minority Report, Iron Man's JARVIS) — glowing nodes, animated data flows, holographic UI elements.

**Target Users:** Developers, architects, DevOps engineers who want to visualize and document their cloud infrastructure in an engaging way.

**Live URL:** `pulsar.jurigregg.com` (planned)

## Hosting & Infrastructure

Pulsar will be hosted on AWS, leveraging existing jurigregg.com infrastructure:

| Service | Purpose |
|---------|---------|
| **Route53** | DNS - `pulsar.jurigregg.com` subdomain |
| **CloudFront** | CDN for static assets, SSL termination |
| **S3** | Static hosting (React build), diagram storage |
| **API Gateway** | REST API for diagrams CRUD |
| **Lambda** | Serverless API handlers |
| **DynamoDB** | Diagram metadata, user data |
| **Cognito** | User authentication |

### Architecture Diagram
```
                         ┌─────────────────┐
                         │   Route53       │
                         │ pulsar.jurigregg│
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │   CloudFront    │
                         │   (CDN + SSL)   │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
           ┌────────▼────────┐        ┌────────▼────────┐
           │       S3        │        │  API Gateway    │
           │  (Static Site)  │        │   /api/*        │
           └─────────────────┘        └────────┬────────┘
                                               │
                                      ┌────────▼────────┐
                                      │     Lambda      │
                                      │   (Handlers)    │
                                      └────────┬────────┘
                                               │
                              ┌────────────────┼────────────────┐
                              │                │                │
                     ┌────────▼───────┐ ┌──────▼──────┐ ┌──────▼──────┐
                     │    DynamoDB    │ │     S3      │ │   Cognito   │
                     │   (Metadata)   │ │ (Diagrams)  │ │   (Auth)    │
                     └────────────────┘ └─────────────┘ └─────────────┘
```

## Core Features (MVP)

### Phase 1: Foundation
- [ ] Project setup (Vite + React + Three.js)
- [ ] Basic 3D scene with orbit controls
- [ ] Hardcoded node rendering with glow effects
- [ ] Animated edge particles
- [ ] HUD overlay with sci-fi styling

### Phase 2: Interactivity
- [ ] Click to select nodes
- [ ] Drag nodes to reposition
- [ ] Zoom to fit / reset view
- [ ] Node info panel

### Phase 3: Data Management
- [ ] Define graph schema (nodes/edges)
- [ ] Import from JSON
- [ ] Export to JSON
- [ ] Local save/load (localStorage)

### Phase 4: Editor
- [ ] Add node (from palette)
- [ ] Delete node
- [ ] Add/remove connections
- [ ] Edit node properties

### Phase 5: Polish
- [ ] Post-processing effects (bloom, etc.)
- [ ] AWS service icon library
- [ ] Multiple layout algorithms
- [ ] Export as PNG/SVG
- [ ] Keyboard shortcuts

### Phase 6: Backend Integration
- [ ] AWS CDK infrastructure setup
- [ ] Cognito authentication (sign up/in)
- [ ] Save diagrams to cloud (DynamoDB + S3)
- [ ] Load user's diagrams
- [ ] Share diagrams (public links)

### Phase 7: Deployment
- [ ] S3 static hosting
- [ ] CloudFront distribution
- [ ] Route53 subdomain setup
- [ ] CI/CD pipeline

## Future Features (Post-MVP)
- Import from CloudFormation/CDK/Terraform
- Real-time AWS resource status
- Multiplayer collaboration
- Animation timeline for presentations
- VR/AR support
- Custom themes

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App Shell                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │    3D Canvas        │  │      HUD Overlay            │   │
│  │  ┌───────────────┐  │  │  ┌─────────────────────┐    │   │
│  │  │ Scene         │  │  │  │ Toolbar             │    │   │
│  │  │  - Nodes      │  │  │  ├─────────────────────┤    │   │
│  │  │  - Edges      │  │  │  │ Node Inspector      │    │   │
│  │  │  - Grid       │  │  │  ├─────────────────────┤    │   │
│  │  │  - Particles  │  │  │  │ Minimap (future)    │    │   │
│  │  │  - Lighting   │  │  │  └─────────────────────┘    │   │
│  │  └───────────────┘  │  └─────────────────────────────┘   │
│  └─────────────────────┘                                     │
├─────────────────────────────────────────────────────────────┤
│                    Zustand Store                             │
│  - nodes[]        - selectedNodeId    - camera state        │
│  - edges[]        - mode (view/edit)  - UI preferences      │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Frontend
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Build | Vite | Fast dev server, good React/TS support |
| UI | React 18 | Component model, ecosystem |
| 3D | Three.js | Industry standard, well documented |
| 3D React | @react-three/fiber | React paradigm for Three.js |
| 3D Helpers | @react-three/drei | Orbit controls, helpers, etc. |
| Effects | @react-three/postprocessing | Bloom, glitch, sci-fi effects |
| State | Zustand | Simple, minimal boilerplate |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Types | TypeScript | Type safety (progressive adoption) |

### Backend (AWS)
| Service | Technology | Rationale |
|---------|------------|-----------|
| IaC | AWS CDK | TypeScript, existing knowledge |
| Auth | Cognito | Managed auth, integrates with API GW |
| API | API Gateway + Lambda | Serverless, cost-effective |
| Database | DynamoDB | Schemaless, scales well |
| Storage | S3 | Diagram JSON files, exports |
| CDN | CloudFront | Fast global delivery, SSL |
| DNS | Route53 | Already managing jurigregg.com |

## Data Model

### Graph Schema
```typescript
interface Node {
  id: string;
  type: AWSServiceType;
  label: string;
  position: [number, number, number];
  color?: string;
  metadata?: Record<string, unknown>;
}

interface Edge {
  id: string;
  source: string;  // node id
  target: string;  // node id
  animated?: boolean;
  style?: 'solid' | 'dashed';
  label?: string;
}

interface Graph {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  metadata?: {
    createdAt: string;
    updatedAt: string;
    version: string;
  };
}
```

### AWS Service Types (Initial Set)
- compute: Lambda, EC2, ECS, Fargate
- database: DynamoDB, RDS, Aurora, ElastiCache
- storage: S3, EFS, EBS
- network: APIGateway, CloudFront, Route53, VPC, ALB
- integration: SQS, SNS, EventBridge, StepFunctions
- security: Cognito, IAM, WAF
- analytics: Kinesis, Athena, Glue
- ml: SageMaker, Bedrock

## Design Principles

1. **Visual First** — Looks matter. Prioritize aesthetics.
2. **Performance** — 60fps minimum. Use instancing, LOD if needed.
3. **Intuitive** — Discoverable UI. Minimal learning curve.
4. **Extensible** — Easy to add new node types, layouts, exporters.
5. **Offline First** — Works without backend. Cloud sync is optional.

## Cost Management ⚠️

**This is critical.** No AWS service gets added without understanding its cost implications.

### Cost Principles
1. **Free Tier First** — Always check if service has free tier, stay within limits
2. **Serverless Preference** — Lambda, DynamoDB, S3 scale to zero when unused
3. **No Surprises** — Every INITIAL spec must include cost estimate
4. **Alerts Required** — AWS Budget alerts before any deployment
5. **Review Monthly** — Check actual vs expected costs

### AWS Free Tier Limits (12-month)
| Service | Free Tier | Notes |
|---------|-----------|-------|
| Lambda | 1M requests, 400K GB-sec/mo | Essentially free for our scale |
| API Gateway | 1M API calls/mo | Generous for dev/small prod |
| DynamoDB | 25GB storage, 25 RCU/WCU | On-demand pricing after |
| S3 | 5GB storage, 20K GET, 2K PUT | Minimal for diagram JSON |
| CloudFront | 1TB transfer, 10M requests/mo | Usually stays in free tier |
| Cognito | 50K MAU | More than enough |

### Cost Estimation Template
Every INITIAL spec involving AWS services MUST include:
```markdown
## Cost Estimate
| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| Lambda  | X requests     | $0.00        |
| DynamoDB| X GB, X RCU    | $0.00        |
| Total   |                | $X.XX        |

**Free Tier Eligible:** Yes/No
**Alerts Configured:** Yes/No
```

### Required Before First Deploy
- [ ] AWS Budget set ($5/month alert, $10 hard limit initially)
- [ ] CloudWatch billing alarm configured
- [ ] Cost allocation tags on all resources (`project: pulsar`)
- [ ] Monthly cost review calendar reminder

### Cost Red Flags — Do NOT Use Without Discussion
- NAT Gateway ($30+/mo minimum)
- Elastic IPs (if not attached)
- RDS (use DynamoDB instead)
- ECS/EKS (overkill, use Lambda)
- Kinesis, OpenSearch, Neptune (expensive)

## Open Questions

- [x] Name? → **Pulsar**
- [x] Hosting? → **pulsar.jurigregg.com** on AWS
- [ ] License? (MIT? Apache 2.0?)
- [ ] Support non-AWS clouds? (GCP, Azure icons)
