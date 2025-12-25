# PRP: 15 - Node Type Dropdown & AWS Service Icons

> Generated from: `INITIAL/initial-15-node-type-dropdown-icons.md`
> Generated on: 2025-12-24
> Confidence: 9/10

## Summary

Add a dropdown in NodeInfoPanel to select AWS service types for nodes, and display service labels on nodes in the 3D view. This transforms Pulsar from a generic graph visualizer into a meaningful AWS architecture diagramming tool.

## Requirements Addressed

1. **Type Selection Dropdown** - Add dropdown to NodeInfoPanel with ~25 AWS services grouped by category
2. **Service Label Display** - Show service type label on or near nodes in 3D view
3. **Auto-save on Change** - Type changes trigger auto-save automatically
4. **Default Type** - New nodes default to "Generic" type
5. **Persistence** - Type persists through save/load and export/import

## Technical Approach

### AWS Services Configuration

Create centralized config file with services grouped by category:
- Compute: Lambda, EC2, ECS, Fargate
- Storage: S3, EFS, EBS
- Database: DynamoDB, RDS, Aurora, ElastiCache
- Networking: API Gateway, CloudFront, Route 53, VPC, ALB
- Integration: SQS, SNS, EventBridge, Step Functions
- Security: Cognito, IAM, WAF
- Other: CloudWatch, Generic

### Dropdown Implementation

Use native HTML `<select>` with `<optgroup>` for category grouping. Styled to match sci-fi aesthetic.

### Label Display

Use `@react-three/drei` Html component to render service name as floating label above node. This approach:
- Is crisp at any zoom level
- Uses familiar HTML/CSS styling
- Can be enhanced with icons later

## Implementation Steps

### Step 1: Create AWS Services Configuration
**Files:** `src/data/awsServices.js` (NEW)

**Changes:**
- [x] Create AWS_SERVICES object with categories and services
- [x] Each service has: key, name, color (optional)
- [x] Export helper functions: getServiceByKey, getAllServicesFlat

**Validation:**
- [x] File exports AWS_SERVICES and helper functions
- [x] At least 25 services defined

### Step 2: Add Type Dropdown to NodeInfoPanel
**Files:** `src/components/hud/NodeInfoPanel.jsx` (MODIFY)

**Changes:**
- [x] Import AWS services config
- [x] Replace static Type display with dropdown
- [x] Group options by category using optgroup
- [x] On change, call updateNode with new type
- [x] Style dropdown to match sci-fi theme

**Validation:**
- [x] Dropdown shows all service categories
- [x] Selecting a type updates the node
- [x] Auto-save triggers (existing functionality)

### Step 3: Add Service Label to Node3D
**Files:** `src/components/canvas/Node3D.jsx` (MODIFY)

**Changes:**
- [x] Import Html from @react-three/drei
- [x] Import getServiceByKey from awsServices
- [x] Add Html component above node with service name
- [x] Style label with sci-fi aesthetic (cyan text, glow)
- [x] Position label above node core

**Validation:**
- [x] Service name visible above each node
- [x] Label is readable at default zoom
- [x] Label updates when type changes

### Step 4: Update Default Type for New Nodes
**Files:** `src/stores/graphStore.js` (MODIFY)

**Changes:**
- [x] Update addNode action to set type: 'generic' by default

**Validation:**
- [x] New nodes have type 'generic'
- [x] Type shows in dropdown and label

### Step 5: Update Documentation
**Files:** `docs/TASK.md` (MODIFY)

**Changes:**
- [x] Mark PRP-15 as complete
- [x] Add session notes
- [x] Commit and push

**Validation:**
- [x] Documentation updated, changes committed

## Dependencies

**No new packages required.**

**Existing dependencies used:**
- `@react-three/drei` - Html component for 3D labels
- Zustand graphStore - updateNode action
- Auto-save hook - already triggers on node changes

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | Client-side only | $0.00 |

**Free Tier Eligible:** Yes (no AWS services)

## Testing Strategy

- [x] Dropdown shows all ~25 AWS services in categories
- [x] Selecting a type updates node.type
- [x] Type change triggers auto-save
- [x] Service label visible on node in 3D view
- [x] New nodes default to 'generic' type
- [x] Type persists through page refresh (localStorage)
- [x] Type persists through export/import

## Rollback Plan

If issues arise:
1. Revert NodeInfoPanel.jsx changes
2. Revert Node3D.jsx changes
3. Remove awsServices.js
4. Type field remains in data model (backward compatible)

## Open Questions

1. **Label position** - Starting with above node, can adjust based on feedback
2. **Icons** - Deferred to fast-follow PRP per INITIAL spec recommendation
3. **Auto-color** - Not implementing in this PRP, can add later if desired
