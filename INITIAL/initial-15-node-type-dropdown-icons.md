# INITIAL-15: Node Type Dropdown & AWS Service Icons

## Overview

Add the ability to assign AWS service types to nodes and display corresponding icons. This transforms Pulsar from a generic graph visualizer into a meaningful AWS architecture diagramming tool.

## User Story

As a user, I want to assign AWS service types (Lambda, S3, DynamoDB, etc.) to my nodes so that my architecture diagrams are immediately recognizable and professional.

## Background

Currently, nodes have a `type` field in the data model but:
- No UI to change the type
- No visual distinction between service types
- Type is just a text string with no validation

After this feature:
- Users can select from a predefined list of AWS services
- Each service type displays its recognizable icon
- Diagrams become self-documenting

## Requirements

### Functional Requirements

1. **FR-1: Type Selection Dropdown**
   - Add dropdown/select to NodeInfoPanel for changing node type
   - Dropdown shows list of supported AWS services
   - Grouped by category (Compute, Storage, Database, etc.)
   - Selecting a type updates the node immediately
   - Auto-save triggers on type change

2. **FR-2: AWS Service Icons**
   - Display service icon on or near node
   - Icons should be recognizable at normal zoom levels
   - Icons should scale appropriately when zooming
   - Consider: icon as texture on node, floating label, or HUD overlay

3. **FR-3: Initial Service Type Set**
   - Start with most common services (can expand later)
   - Include at least one service per major category
   - "Generic" or "Custom" type for non-AWS nodes

4. **FR-4: Default Type for New Nodes**
   - New nodes default to "Generic" or first in list
   - Type persists through save/load cycle

### Non-Functional Requirements

1. **NFR-1: Icon Quality**
   - Use official AWS architecture icons (or close approximation)
   - Icons should be crisp, not pixelated
   - Consider SVG for scalability

2. **NFR-2: Performance**
   - Icons should not significantly impact render performance
   - Consider texture atlasing if using many unique icons

3. **NFR-3: Extensibility**
   - Easy to add new service types later
   - Service definitions in a single config file

## AWS Services - Initial Set

### Compute
| Service | Type Key | Icon Color |
|---------|----------|------------|
| Lambda | `lambda` | Orange |
| EC2 | `ec2` | Orange |
| ECS | `ecs` | Orange |
| Fargate | `fargate` | Orange |

### Storage
| Service | Type Key | Icon Color |
|---------|----------|------------|
| S3 | `s3` | Green |
| EFS | `efs` | Green |
| EBS | `ebs` | Green |

### Database
| Service | Type Key | Icon Color |
|---------|----------|------------|
| DynamoDB | `dynamodb` | Blue |
| RDS | `rds` | Blue |
| Aurora | `aurora` | Blue |
| ElastiCache | `elasticache` | Blue |

### Networking
| Service | Type Key | Icon Color |
|---------|----------|------------|
| API Gateway | `apigateway` | Pink/Magenta |
| CloudFront | `cloudfront` | Purple |
| Route 53 | `route53` | Purple |
| VPC | `vpc` | Purple |
| ALB/ELB | `alb` | Purple |

### Integration
| Service | Type Key | Icon Color |
|---------|----------|------------|
| SQS | `sqs` | Pink |
| SNS | `sns` | Pink |
| EventBridge | `eventbridge` | Pink |
| Step Functions | `stepfunctions` | Pink |

### Security
| Service | Type Key | Icon Color |
|---------|----------|------------|
| Cognito | `cognito` | Red |
| IAM | `iam` | Red |
| WAF | `waf` | Red |

### Other
| Service | Type Key | Icon Color |
|---------|----------|------------|
| CloudWatch | `cloudwatch` | Pink |
| Generic | `generic` | Gray |

**Total: ~25 services** - Enough to diagram most architectures.

## Technical Approach

### Option A: 3D Sprite Icons (Recommended)

Display icons as sprites floating above/beside the node core:

```jsx
// In Node3D.jsx
<sprite position={[0, 0.8, 0]} scale={[0.4, 0.4, 1]}>
  <spriteMaterial map={iconTexture} transparent />
</sprite>
```

**Pros:** Stays in 3D space, billboards to camera, scales with zoom
**Cons:** Needs texture loading, may need texture atlas

### Option B: HTML Overlay Labels

Use drei's `Html` component to render HTML icons:

```jsx
import { Html } from '@react-three/drei'

<Html position={[0, 1, 0]} center>
  <img src={iconUrl} className="w-6 h-6" />
</Html>
```

**Pros:** Crisp at any zoom, easy to style, familiar HTML/CSS
**Cons:** Can feel disconnected from 3D, potential z-fighting

### Option C: Icon as Node Texture

Replace solid color core with icon texture:

**Pros:** Clean, integrated look
**Cons:** Loses color-coding, harder to implement, icons may be hard to read on sphere

### Recommendation

**Start with Option B (HTML overlay)** for simplicity and iteration speed. Can migrate to Option A later if needed for performance or aesthetics.

### Service Type Configuration

Create a centralized config file:

```javascript
// src/data/awsServices.js
export const AWS_SERVICES = {
  compute: {
    label: 'Compute',
    services: [
      { key: 'lambda', name: 'Lambda', icon: '/icons/lambda.svg', color: '#FF9900' },
      { key: 'ec2', name: 'EC2', icon: '/icons/ec2.svg', color: '#FF9900' },
      // ...
    ]
  },
  storage: {
    label: 'Storage',
    services: [
      { key: 's3', name: 'S3', icon: '/icons/s3.svg', color: '#3F8624' },
      // ...
    ]
  },
  // ...
};

export const getServiceByKey = (key) => { /* helper */ };
export const getAllServices = () => { /* flat list */ };
```

### Icon Assets

**Option 1: AWS Official Icons**
- Download from: https://aws.amazon.com/architecture/icons/
- SVG format, official look
- May need to host in `/public/icons/`

**Option 2: Simple Text Labels (MVP)**
- Just show service name as text label
- Skip icons for initial implementation
- Add icons as enhancement

**Recommendation:** Start with text labels, add icons as quick follow-up or in same PRP if time permits.

### Dropdown Component

Add to NodeInfoPanel:

```jsx
<select 
  value={node.type} 
  onChange={(e) => updateNode(node.id, { type: e.target.value })}
  className="bg-slate-800 text-cyan-400 ..."
>
  <optgroup label="Compute">
    <option value="lambda">Lambda</option>
    <option value="ec2">EC2</option>
  </optgroup>
  <optgroup label="Storage">
    <option value="s3">S3</option>
  </optgroup>
  {/* ... */}
</select>
```

## Acceptance Criteria

1. [ ] NodeInfoPanel shows dropdown to select AWS service type
2. [ ] Dropdown is grouped by category (Compute, Storage, etc.)
3. [ ] Selecting a type updates the node's type property
4. [ ] Type change triggers auto-save
5. [ ] Service name/label visible on or near the node in 3D view
6. [ ] New nodes default to "Generic" type
7. [ ] Type persists through export/import cycle
8. [ ] At least 20 AWS services available in dropdown

## Out of Scope (Future)

- Service icons on nodes (can be fast-follow)
- Auto-coloring nodes based on service type
- Service-specific metadata (ARN, region, etc.)
- Import from CloudFormation/CDK
- Non-AWS cloud providers (GCP, Azure)

## Dependencies

- NodeInfoPanel (exists)
- updateNode action in graphStore (exists from PRP-13)
- Auto-save (exists from PRP-09)

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/data/awsServices.js` | CREATE | Service type definitions |
| `src/components/ui/NodeInfoPanel.jsx` | MODIFY | Add type dropdown |
| `src/components/canvas/Node3D.jsx` | MODIFY | Add service label display |

## Testing Strategy

1. **Dropdown functionality**
   - Can select different service types
   - Dropdown shows all categories and services
   - Selection updates node data

2. **Persistence**
   - Type survives page refresh (localStorage)
   - Type survives export/import

3. **Visual**
   - Service label/icon visible on node
   - Readable at default zoom level

## Implementation Notes

### MVP vs Full Feature

**MVP (this PRP):**
- Type dropdown with ~25 services
- Text label on node (using Html component)
- No icons yet

**Fast-follow (separate PRP):**
- AWS SVG icons
- Icon display on nodes
- Possibly auto-color by service category

This split keeps the PRP focused and deliverable in one session.

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | Frontend-only feature | $0.00 |

**Total: $0.00** - No AWS services involved.

## Questions for Review

1. **MVP scope:** Text labels only, or include icons in this PRP?
2. **Label position:** Above node, below node, or on node surface?
3. **Auto-color:** Should changing type to Lambda auto-set node color to orange?

---

**Author:** Claude.ai (Planning)  
**For:** Claude Code (Implementation)  
**Phase:** 5 - Polish  
**Priority:** High (second Phase 5 feature)
