# INITIAL-18: AWS Service Icons

## Problem Statement

Currently, nodes display floating text labels showing the AWS service name (e.g., "Lambda", "S3"), but all nodes look identical — the same icosahedron shape regardless of service type. Users must read labels to identify services, which breaks the "at a glance" understanding that good architecture diagrams provide.

AWS architecture diagrams are instantly recognizable because each service has a distinct icon. We need visual differentiation that works with our sci-fi aesthetic.

## User Story

**As a** user creating an AWS architecture diagram  
**I want** each node to display a recognizable icon for its service type  
**So that** I can quickly identify services visually without reading labels

## Goals

1. Instantly recognizable AWS service icons
2. Professional appearance using official AWS iconography
3. Icons that integrate with our sci-fi aesthetic
4. Easy to add new icons as we expand the service catalog

## Non-Goals

- Animated icons
- Icon customization by users
- Icons for every AWS service (start with our existing 25)
- Icons that bloom/glow (HTML overlay is acceptable)

## Design Approach

### Official AWS Architecture Icons

Use the **official AWS Architecture Icons** from AWS:
- Source: https://aws.amazon.com/architecture/icons/
- Format: SVG (scalable, crisp at any size)
- Well-designed, instantly recognizable by AWS users
- Consistent visual language across services

**Icon Style:**
AWS provides multiple icon styles. We'll use the **64x64 service icons** (colored, with white interior details). These are the standard icons used in AWS architecture diagrams.

### Rendering Method: HTML Overlay with drei

Use `@react-three/drei`'s `Html` component (same as current floating labels):
- Positions HTML element in 3D space
- Already proven to work well in our codebase
- Easy to style with CSS
- Clean, crisp rendering at all zoom levels

**Trade-off acknowledged:** HTML elements don't receive bloom post-processing. However:
- The node core still glows (provides the sci-fi aesthetic)
- Icons remain crisp and readable (better for usability)
- Simpler implementation

**Alternative considered:** Sprite billboards with textures — more complex, icons would bloom but potentially look washed out.

### Icon Asset Management

**Approach: Static SVG imports**
- Download official AWS icons for our 25 services
- Store in `src/assets/aws-icons/` directory
- Import directly in components
- Vite handles SVG optimization

**File naming convention:**
```
src/assets/aws-icons/
  lambda.svg
  ec2.svg
  s3.svg
  dynamodb.svg
  ...
```

## Technical Requirements

### Functional Requirements

1. **FR-1: Icon Display**
   - Each node displays the official AWS icon based on its `type` property
   - Icon is positioned above the node (near the existing label)
   - Icon maintains proper aspect ratio
   - Icon size is consistent across all service types

2. **FR-2: Icon + Label Layout**
   - Icon appears above the node core
   - Service name label appears below the icon (or icon replaces label)
   - Clean vertical stack: Icon → Label → Node
   - Option: Icon only (hide redundant label) for cleaner look

3. **FR-3: Icon Fallback**
   - Nodes with `type: 'generic'` show a generic AWS/cloud icon or no icon
   - Unknown types fall back to generic
   - Missing icon file doesn't break rendering

4. **FR-4: Icon Visibility**
   - Icons scale appropriately with camera distance (Html component handles this)
   - Icons remain readable at typical zoom levels
   - Consider hiding icons when very zoomed out (optional)

### Non-Functional Requirements

1. **NFR-1: Performance**
   - SVG icons are lightweight
   - No runtime processing needed
   - Minimal impact on frame rate

2. **NFR-2: Extensibility**
   - Adding new icon = adding SVG file + registry entry
   - Clear, consistent file naming

3. **NFR-3: Licensing**
   - AWS Architecture Icons are free to use for architecture diagrams
   - Include attribution if required by AWS terms

## Component Changes

| File | Change |
|------|--------|
| `src/assets/aws-icons/` (new dir) | Official AWS SVG icons (25 files) |
| `src/data/awsIcons.js` (new) | Icon registry mapping type → import |
| `src/components/3d/ServiceIcon.jsx` (new) | Html component rendering the icon |
| `src/components/3d/Node.jsx` | Import and render `ServiceIcon` |
| `src/components/3d/FloatingLabel.jsx` | May modify or remove if icon replaces label |

## Icon Registry Design

```javascript
// src/data/awsIcons.js

// Import all icons
import lambdaIcon from '../assets/aws-icons/lambda.svg';
import ec2Icon from '../assets/aws-icons/ec2.svg';
import s3Icon from '../assets/aws-icons/s3.svg';
import dynamodbIcon from '../assets/aws-icons/dynamodb.svg';
// ... etc

export const awsIcons = {
  // Compute
  lambda: lambdaIcon,
  ec2: ec2Icon,
  ecs: ecsIcon,
  fargate: fargateIcon,
  
  // Storage
  s3: s3Icon,
  efs: efsIcon,
  ebs: ebsIcon,
  
  // Database
  dynamodb: dynamodbIcon,
  rds: rdsIcon,
  aurora: auroraIcon,
  elasticache: elasticacheIcon,
  
  // Networking
  apigateway: apigatewayIcon,
  cloudfront: cloudfrontIcon,
  route53: route53Icon,
  vpc: vpcIcon,
  alb: albIcon,
  
  // Integration
  sqs: sqsIcon,
  sns: snsIcon,
  eventbridge: eventbridgeIcon,
  stepfunctions: stepfunctionsIcon,
  
  // Security
  cognito: cognitoIcon,
  iam: iamIcon,
  waf: wafIcon,
  
  // Monitoring
  cloudwatch: cloudwatchIcon,
  
  // Fallback
  generic: null, // or a generic cloud icon
};

export const getIcon = (type) => awsIcons[type] || awsIcons.generic;
```

## ServiceIcon Component

```jsx
// src/components/3d/ServiceIcon.jsx
import { Html } from '@react-three/drei';
import { getIcon } from '../../data/awsIcons';

export default function ServiceIcon({ type, position }) {
  const iconSrc = getIcon(type);
  
  if (!iconSrc) return null;
  
  return (
    <Html
      position={[position[0], position[1] + 1.2, position[2]]}
      center
      style={{ pointerEvents: 'none' }}
    >
      <img 
        src={iconSrc} 
        alt={type}
        className="w-8 h-8 drop-shadow-lg"
        style={{ filter: 'drop-shadow(0 0 4px rgba(0, 255, 255, 0.5))' }}
      />
    </Html>
  );
}
```

## Visual Mockup

```
         ┌─────┐
         │ 🟧  │  ← AWS icon (official, colored)
         └─────┘
        "Lambda"   ← service label (optional, may hide)
              
         ╭─────────╮
        ╱           ╲
       │  ◈─────◈    │  ← glowing icosahedron core
        ╲           ╱
         ╰─────────╯
           ╰ glow ╯
```

Icon floats above the node, label below icon (or hidden for cleaner look).

## Implementation Strategy

### Phase 1: Acquire Icons
1. Download official AWS Architecture Icons from AWS
2. Extract the 25 service icons we need (64x64 SVG versions)
3. Place in `src/assets/aws-icons/` with consistent naming
4. Verify all icons render correctly

### Phase 2: Icon Registry
1. Create `awsIcons.js` with imports for all icons
2. Map service type keys to icon imports
3. Export helper function `getIcon(type)`

### Phase 3: ServiceIcon Component
1. Create `ServiceIcon.jsx` using drei's `Html` component
2. Position above node
3. Add subtle glow effect via CSS drop-shadow
4. Handle missing icons gracefully

### Phase 4: Integration
1. Add `<ServiceIcon>` to `Node.jsx`
2. Decide: keep label, hide label, or make icon clickable
3. Test with various node types
4. Adjust positioning and sizing

## AWS Icons Needed (25 services)

| Category | Service | Icon Filename |
|----------|---------|---------------|
| **Compute** | Lambda | `lambda.svg` |
| | EC2 | `ec2.svg` |
| | ECS | `ecs.svg` |
| | Fargate | `fargate.svg` |
| **Storage** | S3 | `s3.svg` |
| | EFS | `efs.svg` |
| | EBS | `ebs.svg` |
| **Database** | DynamoDB | `dynamodb.svg` |
| | RDS | `rds.svg` |
| | Aurora | `aurora.svg` |
| | ElastiCache | `elasticache.svg` |
| **Networking** | API Gateway | `apigateway.svg` |
| | CloudFront | `cloudfront.svg` |
| | Route 53 | `route53.svg` |
| | VPC | `vpc.svg` |
| | ALB | `alb.svg` |
| **Integration** | SQS | `sqs.svg` |
| | SNS | `sns.svg` |
| | EventBridge | `eventbridge.svg` |
| | Step Functions | `stepfunctions.svg` |
| **Security** | Cognito | `cognito.svg` |
| | IAM | `iam.svg` |
| | WAF | `waf.svg` |
| **Monitoring** | CloudWatch | `cloudwatch.svg` |
| **Generic** | (none) | No icon or generic cloud |

## Acceptance Criteria

- [ ] All 25 AWS service types display their official icon
- [ ] Icons positioned consistently above nodes
- [ ] Icons have subtle glow effect (CSS drop-shadow)
- [ ] Icons scale appropriately with zoom
- [ ] Generic nodes show no icon (or a generic fallback)
- [ ] No console errors for missing icons
- [ ] Icons don't interfere with node selection/dragging
- [ ] Adding a new icon only requires: SVG file + registry entry
- [ ] Performance remains smooth with 20+ nodes

## Styling Considerations

The official AWS icons are colorful. To integrate with our dark sci-fi theme:

1. **Option A: Use as-is** — The colorful icons pop against the dark background
2. **Option B: Add glow** — CSS `drop-shadow` in cyan adds sci-fi feel
3. **Option C: Desaturate** — CSS `filter: saturate(0.7)` tones down colors

**Recommendation:** Option B — keep the recognizable AWS colors but add a subtle cyan glow to tie into the aesthetic.

```css
.aws-icon {
  filter: drop-shadow(0 0 4px rgba(0, 255, 255, 0.4));
}
```

## Performance Considerations

- SVG icons are tiny (~1-5KB each)
- Static imports are bundled at build time
- No runtime processing
- `Html` component from drei is optimized for this use case

## Testing Strategy

1. **Visual test:** Add nodes of each service type, verify correct icons appear
2. **Layout test:** Verify icons don't overlap with labels or nodes
3. **Zoom test:** Zoom in/out, verify icons remain readable
4. **Selection test:** Click nodes, verify icons don't block interaction
5. **Fallback test:** Add node with `type: 'generic'`, verify graceful handling
6. **Performance test:** Create 30+ nodes, verify smooth 60fps

## Out of Scope

- Icon animations (pulse, spin)
- Icon size customization
- Alternative icon styles (light mode, etc.)
- Tooltip on icon hover

## Open Questions

1. **Keep or hide the text label when icon is present?**
   - **Option A:** Keep both (icon above, label below) — more information
   - **Option B:** Icon only — cleaner look, less clutter
   - **Recommendation:** Start with both, add toggle option later if needed

2. **Icon click behavior?**
   - Should clicking the icon select the node? (probably yes, same as clicking node)
   - **Recommendation:** Let clicks pass through to node (pointer-events: none on icon)

---

**Ready for handoff to Claude Code** — Once approved, use `/generate-prp` to create the implementation plan.
