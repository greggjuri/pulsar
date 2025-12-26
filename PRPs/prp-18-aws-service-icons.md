# PRP: 18 - AWS Service Icons

> Generated from: `INITIAL/initial-18-aws-service-icons.md`
> Generated on: 2025-12-26
> Confidence: 8/10

## Summary

Add official AWS Architecture Icons to nodes, displaying the appropriate service icon (e.g., Lambda orange function icon, S3 green bucket icon) above each node based on its `type` property. Icons will be rendered using drei's `Html` component, positioned above the node core, with a subtle cyan glow to integrate with the sci-fi aesthetic.

## Requirements Addressed

1. **FR-1:** Each node displays the official AWS icon based on its `type` property
2. **FR-2:** Icon positioned above the node, service name label below (or replaced)
3. **FR-3:** Nodes with `type: 'generic'` show no icon; unknown types fallback gracefully
4. **FR-4:** Icons scale appropriately with camera distance
5. **NFR-1:** Performance remains smooth (lightweight SVG icons)
6. **NFR-2:** Extensibility — adding new icons requires only SVG + registry entry

## Technical Approach

### Icon Source
Download official AWS Architecture Icons (64x64 SVG versions) from the AWS icon package. These are the standard icons used in AWS architecture diagrams — colored with white interior details.

### Rendering Method
Use `@react-three/drei`'s `Html` component (already used for floating labels in `Node3D.jsx`). This approach:
- Already proven in the codebase
- Crisp rendering at all zoom levels
- Easy to style with CSS
- Icons won't bloom (intentional — keeps them readable)

### Icon Registry
Create a centralized registry mapping service type keys to SVG imports. Uses Vite's static asset handling for optimal bundling.

### Node Modification
Replace or augment the current floating label with an icon + label stack. The icon will be positioned at the same height as the current label, with optional text label below.

## Implementation Steps

### Step 1: AWS Icons Already Downloaded
**Files:** `src/assets/Architecture-Service-Icons_07312025/` (already present)

The AWS Architecture Icons have already been downloaded. Icons are located at paths like:
```
src/assets/Architecture-Service-Icons_07312025/Arch_AWS-Lambda/64/Arch_AWS-Lambda_64.svg
```

**Icon paths for our 24 services:**

| Service | Path |
|---------|------|
| lambda | `Arch_Compute/64/Arch_AWS-Lambda_64.svg` |
| ec2 | `Arch_Compute/64/Arch_Amazon-EC2_64.svg` |
| ecs | `Arch_Containers/64/Arch_Amazon-Elastic-Container-Service_64.svg` |
| fargate | `Arch_Containers/64/Arch_AWS-Fargate_64.svg` |
| s3 | `Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg` |
| efs | `Arch_Storage/64/Arch_Amazon-EFS_64.svg` |
| ebs | `Arch_Storage/64/Arch_Amazon-Elastic-Block-Store_64.svg` |
| dynamodb | `Arch_Database/64/Arch_Amazon-DynamoDB_64.svg` |
| rds | `Arch_Database/64/Arch_Amazon-RDS_64.svg` |
| aurora | `Arch_Database/64/Arch_Amazon-Aurora_64.svg` |
| elasticache | `Arch_Database/64/Arch_Amazon-ElastiCache_64.svg` |
| apigateway | `Arch_Networking-Content-Delivery/64/Arch_Amazon-API-Gateway_64.svg` |
| cloudfront | `Arch_Networking-Content-Delivery/64/Arch_Amazon-CloudFront_64.svg` |
| route53 | `Arch_Networking-Content-Delivery/64/Arch_Amazon-Route-53_64.svg` |
| vpc | `Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg` |
| alb | `Arch_Networking-Content-Delivery/64/Arch_Elastic-Load-Balancing_64.svg` |
| sqs | `Arch_App-Integration/64/Arch_Amazon-Simple-Queue-Service_64.svg` |
| sns | `Arch_App-Integration/64/Arch_Amazon-Simple-Notification-Service_64.svg` |
| eventbridge | `Arch_App-Integration/64/Arch_Amazon-EventBridge_64.svg` |
| stepfunctions | `Arch_App-Integration/64/Arch_AWS-Step-Functions_64.svg` |
| cognito | `Arch_Security-Identity-Compliance/64/Arch_Amazon-Cognito_64.svg` |
| iam | `Arch_Security-Identity-Compliance/64/Arch_AWS-IAM-Identity-Center_64.svg` |
| waf | `Arch_Security-Identity-Compliance/64/Arch_AWS-WAF_64.svg` |
| cloudwatch | `Arch_Management-Governance/64/Arch_Amazon-CloudWatch_64.svg` |

**Validation:**
- [x] All 24 service icons present (generic has no icon)
- [x] Icons are 64x64 SVG format
- [ ] Icons render correctly in browser (verify during integration)

### Step 2: Create Icon Registry
**Files:** `src/data/awsIcons.js` (NEW)

**Changes:**
- [ ] Create `awsIcons.js` with imports for all 24 icons
- [ ] Export `AWS_ICONS` object mapping type → imported SVG
- [ ] Export `getIcon(type)` helper function
- [ ] Return `null` for `generic` type and unknown types

```javascript
// Structure:
const BASE = '../assets/Architecture-Service-Icons_07312025';

import lambdaIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_AWS-Lambda_64.svg';
import ec2Icon from '../assets/Architecture-Service-Icons_07312025/Arch_Compute/64/Arch_Amazon-EC2_64.svg';
import ecsIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_Amazon-Elastic-Container-Service_64.svg';
import fargateIcon from '../assets/Architecture-Service-Icons_07312025/Arch_Containers/64/Arch_AWS-Fargate_64.svg';
import s3Icon from '../assets/Architecture-Service-Icons_07312025/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg';
// ... etc (all 24 imports)

export const AWS_ICONS = {
  lambda: lambdaIcon,
  ec2: ec2Icon,
  ecs: ecsIcon,
  fargate: fargateIcon,
  s3: s3Icon,
  // ... etc
  generic: null,
};

export const getIcon = (type) => AWS_ICONS[type] ?? null;
```

**Validation:**
- [ ] All 24 icons imported successfully
- [ ] `getIcon('lambda')` returns valid path
- [ ] `getIcon('generic')` returns null
- [ ] `getIcon('unknown')` returns null

### Step 3: Update Node3D Component
**Files:** `src/components/canvas/Node3D.jsx` (MODIFY)

**Changes:**
- [ ] Import `getIcon` from `awsIcons.js`
- [ ] Get icon for current node type: `const iconSrc = getIcon(type);`
- [ ] Replace current label `Html` component with icon + label stack
- [ ] Icon displayed as `<img>` with `w-8 h-8` (32x32px display size)
- [ ] Add cyan glow via CSS: `drop-shadow(0 0 4px rgba(0, 255, 255, 0.5))`
- [ ] Service name label moved below icon (smaller text)
- [ ] Maintain `pointerEvents: 'none'` on container
- [ ] Conditionally render: only show icon container if `iconSrc` exists

**Current label code (lines 225-240):**
```jsx
<Html position={[0, 1.2, 0]} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
  <div className="text-xs font-mono text-cyan-400 ...">
    {getServiceName(type)}
  </div>
</Html>
```

**New icon + label stack:**
```jsx
<Html position={[0, 1.4, 0]} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
  <div className="flex flex-col items-center gap-0.5">
    {iconSrc && (
      <img
        src={iconSrc}
        alt={getServiceName(type)}
        className="w-8 h-8"
        style={{ filter: 'drop-shadow(0 0 4px rgba(0, 255, 255, 0.5))' }}
      />
    )}
    <div className="text-xs font-mono text-cyan-400 whitespace-nowrap px-1.5 py-0.5 bg-black/60 rounded border border-cyan-500/30"
         style={{ textShadow: '0 0 6px cyan' }}>
      {getServiceName(type)}
    </div>
  </div>
</Html>
```

**Validation:**
- [ ] Lambda node shows Lambda icon above "Lambda" label
- [ ] S3 node shows S3 icon above "S3" label
- [ ] Generic node shows only text label (no icon)
- [ ] Icons have visible cyan glow effect
- [ ] Icons don't block node selection/dragging

### Step 4: Test & Polish
**Files:** None (manual testing)

**Changes:**
- [ ] Test all 25 service types for correct icon display
- [ ] Verify icons render at various zoom levels
- [ ] Check performance with 20+ nodes
- [ ] Adjust icon size if needed (currently 32x32)
- [ ] Adjust vertical position if needed (currently y=1.4)
- [ ] Verify export/import preserves node types correctly

**Validation:**
- [ ] All acceptance criteria from INITIAL spec met
- [ ] No console errors or warnings
- [ ] Smooth 60fps with 30 nodes
- [ ] Icons crisp at all zoom levels

## Dependencies

- No new packages required
- Uses existing `@react-three/drei` Html component
- Uses existing `src/data/awsServices.js` for service names
- AWS Architecture Icons already downloaded to `src/assets/Architecture-Service-Icons_07312025/`

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `src/assets/Architecture-Service-Icons_07312025/` | EXISTS | AWS icons already downloaded |
| `src/data/awsIcons.js` | CREATE | Icon registry with imports |
| `src/components/canvas/Node3D.jsx` | MODIFY | Render icon above label |

## Testing Strategy

- [ ] Visual test: Add nodes of each service type, verify correct icons
- [ ] Layout test: Icons don't overlap with nodes or labels
- [ ] Zoom test: Icons remain readable at all zoom levels
- [ ] Selection test: Clicking through icon still selects node
- [ ] Fallback test: Generic nodes show no icon
- [ ] Performance test: 30+ nodes maintain 60fps
- [ ] Export/import test: Node types preserved correctly

## Rollback Plan

1. Delete `src/assets/aws-icons/` directory
2. Delete `src/data/awsIcons.js`
3. Revert `Node3D.jsx` to previous label-only version
4. Commit revert

## Open Questions

1. **Label visibility with icon:** The INITIAL spec suggests keeping both icon and label. This is implemented as recommended. If cleaner look is preferred later, label can be hidden when icon is present.

2. **AWS Icon Licensing:** AWS Architecture Icons are free to use for architecture diagrams per AWS terms. No attribution required in the application, but acknowledgment in README is good practice.

## Confidence Score: 9/10

**Reasoning:**
- **+** Clear, detailed INITIAL spec with specific requirements
- **+** Rendering approach (drei Html) already proven in codebase
- **+** Simple component modification, no architectural changes
- **+** Icon registry pattern is straightforward
- **+** AWS icons already downloaded — no external dependency
- **-1** Minor uncertainty about optimal icon size and position (may need tuning)

**No blockers** — Ready for implementation.
